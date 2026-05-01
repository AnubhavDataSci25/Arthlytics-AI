import json
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.models.workspace import ProjectMember, Message
from app.services.ws_manager import manager
from app.services.auth_service import decode_token
from app.models.user import User

router = APIRouter()

def _get_user_from_token(token: str, db: Session) -> User | None:
    payload = decode_token(token)
    if not payload:
        return None
    user = db.query(User).filter_by(id=int(payload["sub"])).first()
    return user if user and user.is_active else None

@router.websocket("/ws/project/{project_id}")
async def websocket_chat(
    websocket: WebSocket,
    project_id: int,
    token: str = Query(...),
):
    db: Session = SessionLocal()
    try:
        # Auth
        user = _get_user_from_token(token, db)
        if not user:
            await websocket.close(code=4001)
            return
        
        # Membership check
        member = db.query(ProjectMember).filter_by(
            project_id=project_id, user_id=user.id
        ).first()
        if not member:
            await websocket.close(code=4003)
            return
        
        await manager.connect(project_id, websocket, user.id, user.username)

        # Announce join
        await manager.broadcast(project_id, {
            "type": "system",
            "content": f"{user.username} joined",
            "online": manager.online_users(project_id),
            "timestamp": datetime.utcnow().isoformat(),
        })

        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            content = data.get("content", "").strip()

            if not content:
                continue

            # Persist message
            msg = Message(
                project_id=project_id,
                user_id=user.id,
                content=content,
                msg_type="chat",
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)

            # Broadcast to all members in project
            await manager.broadcast(project_id, {
                "type": "chat",
                "id": msg.id,
                "user_id": user.id,
                "username": user.username,
                "content": content,
                "timestamp": msg.created_at.isoformat(),
            })
    except WebSocketDisconnect:
        manager.disconnect(project_id, websocket)
        await manager.broadcast(project_id, {
            "type": "system",
            "content": f"{user.username} left",
            "online": manager.online_users(project_id),
            "timestamp": datetime.utcnow().isoformat(),
        })
    finally:
        db.close()