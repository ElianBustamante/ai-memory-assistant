import os
import json
from openai import AsyncOpenAI
from services.memory import query_memory, save_to_memory
from services.db import save_message
from models.database import SessionLocal

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy"))

async def generate_chat_response_stream(user_id: int, session_id: str, user_message: str):
    try:
        similar_messages = query_memory(user_id, session_id, user_message, n_results=3)
    except Exception as e:
        print(f"Error querying memory: {e}")
        similar_messages = []
    
    context_str = ""
    if similar_messages:
        context_str = "Relevant past memories for context:\n"
        for msg in similar_messages:
            context_str += f"- [{msg['role']}]: {msg['content']}\n"
            
    system_prompt = "You are a helpful personal AI assistant. "
    if context_str:
        system_prompt += f"\n{context_str}"
        
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True
        )
        
        yield {"data": json.dumps({"memories": similar_messages})}
        
        full_response = ""
        async for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                full_response += content
                yield {"data": json.dumps({"content": content})}
                
        db = SessionLocal()
        try:
            db_msg = save_message(db, user_id, session_id, "assistant", full_response)
            save_to_memory(user_id, session_id, "assistant", full_response, f"msg_{db_msg.id}")
        finally:
            db.close()
            
    except Exception as e:
        yield {"data": json.dumps({"error": str(e)})}
