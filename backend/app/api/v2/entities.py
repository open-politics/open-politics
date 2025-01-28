import os
from opol import OPOL
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel

opol = OPOL(mode='container', api_key=os.getenv("OPOL_API_KEY", ""))
router = APIRouter()

class Entity(BaseModel):
    name: str
    entity_type: str
    content_count: int
    total_frequency: int
    relevance_score: float

@router.get("/")
async def search_entities(
    query: str = Query(..., description="Search query for entities"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    """
    Search and paginate through entities based on a query.
    """
    entities = opol.entities.by_entity(query, skip, limit)
    return entities

@router.get("/by_entity")
async def get_entity_details(
    entity: str = Query(..., description="Entity for details"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    """
    Retrieve detailed information about a specific entity.
    """
    entity_data = opol.entities.by_entity(entity, skip, limit)
    if not entity_data:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity_data