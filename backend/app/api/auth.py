from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth")

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if auth_service.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if auth_service.get_user_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user = auth_service.create_user(db,data)
    token = auth_service.create_access_token({"sub": str(user.id), "email": user.email})

    return TokenResponse(access_token=token, user=user)

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    token = auth_service.create_access_token({"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=token, user=user)