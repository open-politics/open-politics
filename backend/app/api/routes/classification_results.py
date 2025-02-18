from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional, Union, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import joinedload
from pydantic import BaseModel, model_validator, Field

from app.models import (
    ClassificationResult,
    ClassificationResultCreate,
    ClassificationResultRead,
    EnhancedClassificationResultRead,
    Document,
    DocumentRead,
    ClassificationScheme,
    ClassificationSchemeRead,
    Workspace
)
from app.api.deps import SessionDep, CurrentUser
from app.api.v2.classification import classify_text 

router = APIRouter(
    prefix="/workspaces/{workspace_id}/classification_results",
    tags=["ClassificationResults"]
)

@router.post("", response_model=ClassificationResultRead)
def create_classification_result(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    result_in: ClassificationResultCreate
) -> ClassificationResultRead:
    """
    Create (store) an individual classification result.
    Verifies that the workspace exists and that the referenced document and scheme belong to that workspace.
    """
    # Check workspace permission
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Retrieve and validate document
    document = session.get(Document, result_in.document_id)
    if not document or document.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Document not found in this workspace")
    
    # Retrieve and validate scheme
    scheme = session.get(ClassificationScheme, result_in.scheme_id)
    if not scheme or scheme.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Classification scheme not found in this workspace")
    
    # Get classification result
    classification_output = classify_text(document.text_content, scheme.id)
    
    # Create the classification result storing the raw output
    classification_result = ClassificationResult(
        document_id=result_in.document_id,
        scheme_id=result_in.scheme_id,
        value=classification_output,
        timestamp=result_in.timestamp or datetime.now(timezone.utc),  # Ensure UTC timestamp
        run_name=result_in.run_name,
        run_description=result_in.run_description
    )
    
    session.add(classification_result)
    session.commit()
    session.refresh(classification_result)
    
    # Format the response
    return ClassificationResultRead(
        id=classification_result.id,
        document_id=classification_result.document_id,
        scheme_id=classification_result.scheme_id,
        value=classification_result.value,
        timestamp=classification_result.timestamp,
        run_name=classification_result.run_name,
        run_description=classification_result.run_description,
        document=DocumentRead.model_validate(document),
        scheme=ClassificationSchemeRead.model_validate(scheme)
    )


@router.get("/{result_id}", response_model=ClassificationResultRead)
def get_classification_result(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    result_id: int
) -> ClassificationResultRead:
    """
    Load (retrieve) an individual classification result by its ID.
    Verifies that this result's document and scheme belong to the workspace.
    """
    # Check that the workspace exists and belongs to the current user
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Updated query with joinedload
    result = session.exec(
        select(ClassificationResult)
        .options(
            joinedload(ClassificationResult.document),
            joinedload(ClassificationResult.scheme)
        )
        .where(ClassificationResult.id == result_id)
    ).first()

    if not result or not result.document or not result.scheme:
        raise HTTPException(status_code=404, detail="Result not found")

    # Simplify response construction
    return ClassificationResultRead(
        id=result.id,
        document_id=result.document_id,
        scheme_id=result.scheme_id,
        value=result.value,
        timestamp=result.timestamp,
        run_name=result.run_name,
        run_description=result.run_description,
        document=DocumentRead.model_validate(result.document),
        scheme=ClassificationSchemeRead.model_validate(result.scheme)
    )

@router.get("", response_model=List[EnhancedClassificationResultRead])
@router.get("/", response_model=List[EnhancedClassificationResultRead])
def list_classification_results(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    document_ids: List[int] = Query(None),
    scheme_ids: List[int] = Query(None),
    run_name: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100
) -> List[EnhancedClassificationResultRead]:
    """
    List all classification results for the given workspace.
    """
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    base_stmt = select(ClassificationResult).where(
        ClassificationResult.document_id.in_(
            select(Document.id).where(Document.workspace_id == workspace_id)
        )
    )

    if document_ids:
        base_stmt = base_stmt.where(ClassificationResult.document_id.in_(document_ids))
    if scheme_ids:
        base_stmt = base_stmt.where(ClassificationResult.scheme_id.in_(scheme_ids))
    if run_name:
        base_stmt = base_stmt.where(ClassificationResult.run_name == run_name)

    statement = base_stmt.offset(skip).limit(limit)
    results = session.exec(statement).all()
    
    enhanced_results = []
    for result in results:
        result_data = {
            'id': result.id,
            'document_id': result.document_id,
            'scheme_id': result.scheme_id,
            'value': result.value,
            'timestamp': result.timestamp,
            'run_name': result.run_name,
            'run_description': result.run_description,
            'document': result.document,
            'scheme': result.scheme
        }
        
        # Ensure value is always a dict
        if not isinstance(result_data['value'], dict):
            result_data['value'] = {'value': result_data['value']}
        
        enhanced_results.append(
            EnhancedClassificationResultRead.model_validate(result_data)
        )
    
    return enhanced_results
