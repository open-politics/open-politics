from typing import Any, List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from sqlalchemy import func

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Workspace,
    WorkspaceCreate,
    WorkspaceRead,
    WorkspaceUpdate,
    WorkspacesOut,
)

router = APIRouter(prefix="/workspaces")

# Workspace Routes

@router.post("", response_model=WorkspaceRead)
@router.post("/", response_model=WorkspaceRead)
def create_workspace(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_in: WorkspaceCreate,
) -> Any:
    """
    Create a new workspace.
    """
    workspace = Workspace(
        **workspace_in.model_dump(),
        user_id_ownership=current_user.id,
    )
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    return workspace

@router.get("", response_model=List[WorkspaceRead])
@router.get("/", response_model=List[WorkspaceRead])
def read_workspaces(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
) -> Any:
    """
    Retrieve all workspaces for the current user.
    """
    statement = (
        select(Workspace)
        .where(Workspace.user_id_ownership == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    workspaces = session.exec(statement).all()
    return workspaces

@router.get("/{workspace_id}", response_model=WorkspaceRead)
def read_workspace_by_id(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
) -> Any:
    """
    Get a specific workspace by ID.
    """
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@router.patch("/{workspace_id}", response_model=WorkspaceRead)
def update_workspace(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    workspace_in: WorkspaceUpdate,
) -> Any:
    """
    Update an existing workspace.
    """
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")

    update_data = workspace_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workspace, field, value)
    workspace.updated_at = datetime.now(timezone.utc)

    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    return workspace

@router.delete("/{workspace_id}")
def delete_workspace(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
) -> Any:
    """
    Delete a workspace.
    """
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")
    session.delete(workspace)
    session.commit()
    return {"message": "Workspace deleted successfully"}

@router.post("/ensure-default", response_model=WorkspaceRead)
def ensure_default_workspace(
    *,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Ensure a default workspace exists for the user.
    """
    # Check if user already has workspaces
    statement = select(Workspace).where(Workspace.user_id_ownership == current_user.id)
    existing_workspaces = session.exec(statement).all()
    
    if existing_workspaces:
        return existing_workspaces[0]
    
    # Create default workspace
    default_workspace = Workspace(
        name="My Workspace",
        description="Default workspace",
        user_id_ownership=current_user.id,
        sources=["default"]
    )
    session.add(default_workspace)
    session.commit()
    session.refresh(default_workspace)
    return default_workspace