import json
from datetime import datetime
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # {project_id: [ {ws, user_id, username} ]}
        self.active: dict[int, list[dict]] = {}
    
    async def connect(self, project_id: int, websocket: WebSocket, user_id: int, username: str):
        await websocket.accept()
        self.active.setdefault(project_id, []).append({
            "ws": websocket,
            "user_id": user_id,
            "username": username,
        })
    
    def disconnect(self, project_id: int, websocket: WebSocket):
        conns = self.active.get(project_id, [])
        self.active[project_id] = [c for c in conns if c["ws"] is not websocket]

    async def broadcast(self, project_id: int, payload: dict):
        conns = self.active.get(project_id, [])
        dead = []
        for conn in conns:
            try:
                await conn["ws"].send_text(json.dumps(payload))
            except Exception:
                dead.append(conn)
        for d in dead:
            self.active[project_id].remove(d)
    
    def online_users(self, project_id: int) -> list[str]:
        return [c["username"] for c in self.active.get(project_id, [])]
    
manager = ConnectionManager()