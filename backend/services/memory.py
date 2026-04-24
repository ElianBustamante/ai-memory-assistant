import chromadb
import os
from dotenv import load_dotenv
from chromadb.utils import embedding_functions

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key_env_var="OPENAI_API_KEY",
    model_name="text-embedding-3-small"
)

def get_user_collection(user_id: int):
    return client.get_or_create_collection(
        name=f"user_{user_id}_memory",
        embedding_function=openai_ef
    )

def save_to_memory(user_id: int, session_id: str, role: str, content: str, message_id: str):
    collection = get_user_collection(user_id)
    collection.add(
        documents=[content],
        metadatas=[{"session_id": session_id, "role": role}],
        ids=[message_id]
    )

def query_memory(user_id: int, session_id: str, query_text: str, n_results: int = 3):
    collection = get_user_collection(user_id)
    count = collection.count()
    if count == 0:
        return []
        
    actual_n_results = min(n_results, count)
    
    # We could restrict where={"session_id": session_id} if we only want memory from the same session.
    # But semantic memory is usually across ALL sessions for the user.
    # Let's keep it across all sessions for maximum context, or restrict to the same session?
    # The previous code had where={"session_id": session_id}. Let's remove it to give global user memory.
    
    results = collection.query(
        query_texts=[query_text],
        n_results=actual_n_results,
    )
    
    if not results['documents'] or not results['documents'][0]:
        return []
    
    memories = []
    for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
        memories.append({
            "content": doc,
            "role": meta["role"]
        })
    return memories
