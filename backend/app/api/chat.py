from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import traceback

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.file import UploadedFile
from app.services import ai_service

router = APIRouter(prefix="/chat")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    file_id: int
    query: str
    top_k: Optional[int] = 5

@router.post("")
async def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == body.file_id,
        UploadedFile.user_id == current_user.id,
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not Found")
    
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    if body.top_k and not (1 <= body.top_k <= 10):
        raise HTTPException(status_code=400, detail="top_k must be between 1 and 10")
    
    try:
        result = await ai_service.query_file(
            file_record=db_file,
            query=body.query,
            top_k=body.top_k or 5,
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
    
    return result

@router.delete("/index/{file_id}", status_code=204)
def clear_file_index(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Clear FAISS index for a file - useful after re-upload."""
    db_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.user_id == current_user.id,
    ).first()

    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    ai_service.clear_index(db_file)