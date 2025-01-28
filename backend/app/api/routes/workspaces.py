from typing import Any, Optional, List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, Field, Relationship, Session, select
from sqlalchemy import func, Column, Text
from sqlalchemy.dialects.postgresql import JSON, ARRAY

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import User, Workspace  

router = APIRouter()

# Workspace Models

class WorkspaceBase(SQLModel):
    name: str
    description: Optional[str] = None
    sources: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(Text)))

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceRead(WorkspaceBase):
    uid: int
    user_id_ownership: int
    created_at: datetime
    updated_at: datetime

class WorkspacesOut(SQLModel):
    data: List[WorkspaceRead]
    count: int

# Workspace Routes

@router.post(
    "/create",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=WorkspaceRead
)
def create_workspace(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_in: WorkspaceCreate
) -> Any:
    """
    Create a new workspace.
    Only accessible by superusers.
    """
    # Create a dictionary from the input data and add the user_id_ownership
    workspace_data = workspace_in.model_dump()
    workspace_data['user_id_ownership'] = current_user.id

    # Validate and create the workspace instance
    workspace = Workspace.model_validate(workspace_data)
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    return workspace

@router.get(
    "/read",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=WorkspacesOut
)
def read_workspaces(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all workspaces.
    Only accessible by superusers.
    """
    statement = select(Workspace).offset(skip).limit(limit)
    workspaces = session.exec(statement).all()
    count_statement = select(func.count()).select_from(Workspace)
    count = session.exec(count_statement).one()
    return WorkspacesOut(data=workspaces, count=count)

@router.get(
    "/{workspace_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=WorkspaceRead
)
def read_workspace_by_id(
    *,
    session: SessionDep,
    workspace_id: int
) -> Any:
    """
    Get a specific workspace by ID.
    Only accessible by superusers.
    """
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@router.delete(
    "/{workspace_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=None
)
def delete_workspace(
    *,
    session: SessionDep,
    workspace_id: int
) -> Any:
    """
    Delete a workspace.
    Only accessible by superusers.
    """
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    session.delete(workspace)
    session.commit()
    return {"message": "Workspace deleted successfully"}

@router.patch(
    "/update/{workspace_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=WorkspaceRead
)
def update_workspace(
    *,
    session: SessionDep,
    workspace_id: int,
    workspace_in: WorkspaceCreate, 
) -> Any:
    """
    Update an existing workspace.
    Only accessible by superusers.
    """
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Update the workspace fields
    update_data = workspace_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workspace, field, value)
    workspace.updated_at = datetime.now(timezone.utc)

    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    return workspace

## example post data (raw) to create a workspace
# {
#     "name": "My Workspace",
#     "description": "This is my workspace",
#     "sources": ["source1", "source2"]
# }