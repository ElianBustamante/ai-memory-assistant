from sqlalchemy.orm import Session
from models.database import Conversation

def save_message(db: Session, user_id: int, session_id: str, role: str, content: str):
    db_msg = Conversation(user_id=user_id, session_id=session_id, role=role, content=content)
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg
