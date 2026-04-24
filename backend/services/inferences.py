import json
import os
from openai import OpenAI
from sqlalchemy.orm import Session
from models.database import Conversation, Inference

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy"))

def extract_inferences(user_id: int, db: Session):
    # Fetch up to 50 unprocessed messages for the user
    unprocessed_msgs = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.processed_for_inferences == False
    ).order_by(Conversation.timestamp.asc()).limit(50).all()

    if not unprocessed_msgs:
        return

    history = ""
    for msg in unprocessed_msgs:
        history += f"[{msg.role}]: {msg.content}\n"

    system_prompt = """
    Analyze the following conversation history of a user interacting with an AI assistant.
    Extract key factual inferences about the user (e.g., their name, preferences, job, hobbies).
    Return the inferences in strict JSON format as an object with a single key "inferences", 
    which contains a list of objects, where each object has:
    - "fact": string describing the fact
    - "confidence": string ("high", "medium", or "low")
    
    If no meaningful facts can be extracted, return {"inferences": []}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": history}
            ],
            response_format={"type": "json_object"}
        )
        
        # We need to ensure we parse an array from a JSON object
        # e.g. {"inferences": [{"fact": "...", "confidence": "high"}]}
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Handle cases where the model returns {"inferences": [...]} or just [...]
        inferences_list = data.get("inferences", []) if isinstance(data, dict) else data
        
        if isinstance(inferences_list, list):
            for item in inferences_list:
                fact = item.get("fact")
                confidence = item.get("confidence")
                if fact and confidence:
                    new_inf = Inference(user_id=user_id, fact=fact, confidence=confidence)
                    db.add(new_inf)
        
        # Mark as processed
        for msg in unprocessed_msgs:
            msg.processed_for_inferences = True
            
        db.commit()
    except Exception as e:
        print(f"Error extracting inferences: {e}")
        db.rollback()
