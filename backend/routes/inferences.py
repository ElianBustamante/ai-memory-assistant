from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, User, Inference
from models.schemas import InferenceResponse
from services.auth import get_current_user

router = APIRouter(prefix="/profile/inferences", tags=["inferences"])

@router.get("", response_model=List[InferenceResponse])
def get_inferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inferences = db.query(Inference).filter(Inference.user_id == current_user.id).all()
    return inferences

@router.delete("/{inference_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inference(
    inference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inference = db.query(Inference).filter(
        Inference.id == inference_id,
        Inference.user_id == current_user.id
    ).first()
    
    if not inference:
        raise HTTPException(status_code=404, detail="Inference not found")
        
    db.delete(inference)
    db.commit()
    return None
