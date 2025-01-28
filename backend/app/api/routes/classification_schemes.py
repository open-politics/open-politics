from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models import ClassificationScheme, ClassificationSchemeCreate, ClassificationSchemeRead, ClassificationSchemeUpdate, Workspace
from app.api.deps import SessionDep
from typing import List
from datetime import datetime, timezone

router = APIRouter()

@router.post("/{workspace_id}", response_model=ClassificationSchemeRead)
def create_classification_scheme(
    *,
    session: SessionDep,
    workspace_id: int,
    scheme_in: ClassificationSchemeCreate
) -> ClassificationSchemeRead:
    workspace = session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    scheme = ClassificationScheme(
        **scheme_in.model_dump(),
        workspace_id=workspace_id
    )
    
    session.add(scheme)
    session.commit()
    session.refresh(scheme)
    return scheme

@router.get("/{workspace_id}/{scheme_id}", response_model=ClassificationSchemeRead)
def read_classification_scheme(
    *,
    session: SessionDep,
    workspace_id: int,
    scheme_id: int
) -> ClassificationSchemeRead:
    scheme = session.get(ClassificationScheme, scheme_id)
    if not scheme or scheme.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Classification scheme not found")
    return scheme

@router.get("/{workspace_id}", response_model=List[ClassificationSchemeRead])
def read_classification_schemes(
    *,
    session: SessionDep,
    workspace_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[ClassificationSchemeRead]:
    statement = select(ClassificationScheme).where(ClassificationScheme.workspace_id == workspace_id).offset(skip).limit(limit)
    schemes = session.exec(statement).all()
    return schemes

@router.patch("/{workspace_id}/{scheme_id}", response_model=ClassificationSchemeRead)
def update_classification_scheme(
    *,
    session: SessionDep,
    workspace_id: int,
    scheme_id: int,
    scheme_in: ClassificationSchemeUpdate
) -> ClassificationSchemeRead:
    scheme = session.get(ClassificationScheme, scheme_id)
    if not scheme or scheme.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Classification scheme not found")
    
    for field, value in scheme_in.model_dump(exclude_unset=True).items():
        setattr(scheme, field, value)
    scheme.updated_at = datetime.now(timezone.utc)
    
    session.add(scheme)
    session.commit()
    session.refresh(scheme)
    return scheme

@router.delete("/{workspace_id}/{scheme_id}", response_model=None)
def delete_classification_scheme(
    *,
    session: SessionDep,
    workspace_id: int,
    scheme_id: int
) -> None:
    scheme = session.get(ClassificationScheme, scheme_id)
    if not scheme or scheme.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Classification scheme not found")
    session.delete(scheme)
    session.commit()
    return {"message": "Classification scheme deleted successfully"} 