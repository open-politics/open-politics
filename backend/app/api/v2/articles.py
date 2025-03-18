import os
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict
from pydantic import BaseModel
from app.core.opol_config import opol


import logging
logger = logging.getLogger(__name__)

router = APIRouter()

class ArticleRequest(BaseModel):
    query: str
    limit: Optional[int] = 10
    skip: Optional[int] = 0

class ArticleResponse(BaseModel):
    contents: List[Dict]

@router.get("/basic", response_model=ArticleResponse)
async def get_articles(
    query: str = Query(..., description="Search query for articles"),
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(20, gt=0, le=100, description="Maximum number of articles to return")
):
    articles = opol.articles(query, skip, limit)
    assert isinstance(articles, list)
    assert all(isinstance(article, dict) for article in articles)
    return {"contents": articles}

@router.get("/by_entity/", response_model=ArticleResponse)
@router.get("/by_entity", response_model=ArticleResponse)
async def articles_by_entity(
    entity: str = Query(..., description="Entity for articles"),
    # skip: int = Query(0, ge=0, description="Number of articles to skip"),
    # limit: int = Query(20, gt=0, le=100, description="Maximum number of articles to return"),
    date: str = Query(None, description="Date for articles")
):
    contents = opol.articles.by_entity(entity, 
                                       date if date else None
                                       )
    return {"contents": contents}

@router.get("/by_id", response_model=Dict)
async def article_by_id(
    id: str = Query(..., description="Content ID of the article"),
):
    """Fetch a single article by its content ID."""
    try:
        article = opol.articles.by_id(id)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        return article
    except Exception as e:
        logger.error(f"Error fetching article by ID {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch article: {str(e)}")
