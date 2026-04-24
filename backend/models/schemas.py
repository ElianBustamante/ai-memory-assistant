from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ConversationResponse(BaseModel):
    id: int
    user_id: int
    session_id: str
    role: str
    content: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class InferenceResponse(BaseModel):
    id: int
    fact: str
    confidence: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
