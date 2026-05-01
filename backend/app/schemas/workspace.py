from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

##### Requests #####
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectJoin(BaseModel):
    invite_code: str

class MemberRoleUpdate(BaseModel):
    role: str

##### Responses #####
class UserSnippet(BaseModel):
    id: int
    username: str
    email: str
    model_config = {"from_attributes": True}

class MemberOut(BaseModel):
    id: int
    user: UserSnippet
    role: str
    joined_at: datetime
    model_config = {"from_attributes": True}

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    invite_code: str
    owner_id: int
    created_at: datetime
    members: List[MemberOut] = []
    model_config = {"from_attributes": True}

class MessageOut(BaseModel):
    id: int
    project_id: int
    user_id: int
    username: str
    content: str
    msg_type: str
    created_at: datetime
    model_config = {"from_attributes": True}