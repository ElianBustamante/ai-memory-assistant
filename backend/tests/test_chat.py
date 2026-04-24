import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["OPENAI_API_KEY"] = "dummy"
os.environ["CHROMA_PERSIST_DIR"] = "./chroma_test_data"

from main import app
from models.database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@patch("routes.chat.save_to_memory")
@patch("routes.chat.generate_chat_response_stream")
def test_chat_endpoint(mock_generate, mock_save_memory):
    # Mock the generator
    async def mock_generator(*args, **kwargs):
        yield {"data": '{"content": "Hello"}'}
        yield {"data": '{"content": " World!"}'}
        
    mock_generate.return_value = mock_generator()
    
    response = client.post(
        "/chat",
        json={"message": "Hi", "session_id": "test_session"}
    )
    
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    
    content = response.content.decode()
    assert "data: {\"content\": \"Hello\"}" in content
    assert "data: {\"content\": \" World!\"}" in content
    
    mock_save_memory.assert_called_once()
    assert mock_generate.call_count == 1
