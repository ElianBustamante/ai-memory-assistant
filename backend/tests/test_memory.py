import pytest
from unittest.mock import patch, MagicMock

@patch("services.memory.collection")
def test_save_to_memory(mock_collection):
    from services.memory import save_to_memory
    
    save_to_memory("session_123", "user", "Hello memory!", "msg_1")
    mock_collection.add.assert_called_once_with(
        documents=["Hello memory!"],
        metadatas=[{"session_id": "session_123", "role": "user"}],
        ids=["msg_1"]
    )

@patch("services.memory.collection")
def test_query_memory(mock_collection):
    from services.memory import query_memory
    
    mock_collection.count.return_value = 5
    mock_collection.query.return_value = {
        "documents": [["Past memory 1", "Past memory 2"]],
        "metadatas": [[{"session_id": "session_123", "role": "user"}, {"session_id": "session_123", "role": "assistant"}]]
    }
    
    results = query_memory("session_123", "Hello?", n_results=2)
    
    assert len(results) == 2
    assert results[0]["content"] == "Past memory 1"
    assert results[0]["role"] == "user"
