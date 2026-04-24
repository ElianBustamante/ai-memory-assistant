from fastapi import APIRouter, Depends, BackgroundTasks
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from models.schemas import ChatRequest
from models.database import get_db, User, Conversation
from services.db import save_message
from services.memory import save_to_memory
from services.llm import generate_chat_response_stream
from services.auth import get_current_user
from services.inferences import extract_inferences

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save user message to DB
    db_msg = save_message(db, current_user.id, request.session_id, "user", request.message)
    
    # Save user message to semantic memory
    save_to_memory(current_user.id, request.session_id, "user", request.message, f"msg_{db_msg.id}")
    
    # Trigger background inference job if condition is met
    # Let's count unprocessed messages
    unprocessed_count = db.query(Conversation).filter(
        Conversation.user_id == current_user.id,
        Conversation.processed_for_inferences == False
    ).count()
    
    if unprocessed_count >= 10:
        # Also check if we have messages from at least 2 distinct sessions among unprocessed
        distinct_sessions = db.query(Conversation.session_id).filter(
            Conversation.user_id == current_user.id,
            Conversation.processed_for_inferences == False
        ).distinct().count()
        
        # User requirement: At least 2 conditions. E.g., > 10 messages AND >= 2 sessions
        if distinct_sessions >= 2:
            background_tasks.add_task(extract_inferences, current_user.id, db)
    
    # Return streaming response
    return EventSourceResponse(
        generate_chat_response_stream(current_user.id, request.session_id, request.message)
    )
