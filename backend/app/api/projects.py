import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.workspace import Project, ProjectMember, Message
from app.schemas.workspace import ProjectCreate, ProjectJoin, ProjectOut, MemberOut, MemberRoleUpdate

route = APIRouter(prefix="/projects")

def _get_member(db, project_id, user_id) -> ProjectMember | None:
    return db.query(ProjectMember).filter_by(project_id=project_id, user_id=user_id).first()

def _require_member(db, project_id, user_id, roles=None) -> ProjectMember:
    m = _get_member(db, project_id, user_id)
    if not m:
        raise HTTPException(403, "Not a project member")
    if roles and m.role not in roles:
        raise HTTPException(403, f"Requires role: {roles}")
    return m

##### CRUD #####

@route.post("", response_model=ProjectOut, status_code=201)
def create_project(
    body: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=body.name,
        description=body.description,
        owner_id=current_user.id,
        invite_code=uuid.uuid4().hex[:10].upper(),
    )
    db.add(project)
    db.flush()      # get project_id before adding member

    # Owner auto-joined as Admin
    db.add(ProjectMember(project_id=project.id, user_id=current_user.id, role="Admin"))
    db.commit()
    db.refresh(project)
    return project

@route.get("", response_model=list[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    memberships = db.query(ProjectMember).filter_by(user_id=current_user.id).all()
    project_ids = [m.project_id for m in memberships]
    return db.query(Project).filter(Project.id.in_(project_ids)).all()

@route.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_member(db, project_id, current_user.id)
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    return project

@route.delete("/{project_id}", status_code=404)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter_by(id=project_id, owner_id=current_user.id).first()
    if not project:
        raise HTTPException(404, "Project not found or not owner")
    db.delete(project)
    db.commit()

##### Join/Leave #####

@route.post("/join", response_model=ProjectOut)
def join_project(
    body: ProjectJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter_by(invite_code=body.invite_code).first()
    if not project:
        raise HTTPException(404, "Invalid invite code")
    if _get_member(db, project.id, current_user.id):
        raise HTTPException(400, "Already a member")
    db.add(ProjectMember(project_id=project.id, user_id=current_user.id, role="Viewer"))
    db.commit()
    db.refresh(project)
    return project

@route.delete("/{project_id}/leave", status_code=204)
def leave_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    m = _require_member(db, project_id, current_user.id)
    if m.role == "Admin":
        raise HTTPException(400, "Admin cannot leave. Transfer ownership or delete project.")
    db.delete(m)
    db.commit()

##### Member management #####

@route.patch("/{project_id}/members/{user_id}", response_model=MemberOut)
def update_member_role(
    project_id: int,
    user_id: int,
    body: MemberRoleUpdate,
    db: Session =  Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_member(db, project_id, current_user.id, roles=["Admin"])
    if body.role not in ("Admin", "Editor", "Viewer"):
        raise HTTPException(400, "Invalid role")
    m = _get_member(db, project_id, user_id)
    if not m:
        raise HTTPException(404, "Member not found")
    m.role = body.role
    db.commit()
    db.refresh(m)
    return m

@route.delete("/{project_id}/members/{user_id}", status_code=204)
def remove_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), 
):
    _require_member(db, project_id, current_user.id, roles=["Admin"])
    m = _get_member(db, project_id, user_id)
    if not m:
        raise HTTPException(404, "Member not found")
    db.delete(m)
    db.commit()

##### Message History #####

@route.get("/{project_id}/messages")
def get_messages(
    project_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_member(db, project_id, current_user.id)
    msgs = (
        db.query(Message)
        .filter_by(project_id=project_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": m.id,
            "project_id": m.project_id,
            "user_id": m.user_id,
            "username": m.sender.username,
            "content": m.content,
            "msg_type": m.msg_type,
            "created_at": m.created_at.isoformat(),
        }
        for m in reversed(msgs)
    ]
    