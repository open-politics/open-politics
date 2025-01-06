import os
from opol import OPOL
from fastapi import APIRouter, Query
from typing import Optional, List, Dict
from pydantic import BaseModel

opol = OPOL(mode=os.getenv("OPOL_MODE", "container"), api_key=os.getenv("OPOL_API_KEY", ""))

router = APIRouter()

class ArticleRequest(BaseModel):
    query: str
    limit: Optional[int] = 10
    skip: Optional[int] = 0

class ArticleResponse(BaseModel):
    articles: List[Dict]

@router.get("/", response_model=ArticleResponse)
async def get_articles(
    query: str = Query(..., description="Search query for articles"),
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(20, gt=0, le=100, description="Maximum number of articles to return")
):
    articles = opol.articles(query, skip, limit)
    assert isinstance(articles, list)
    assert all(isinstance(article, dict) for article in articles)
    return {"contents": articles}

@router.get("/by_entity", response_model=ArticleResponse)
async def articles_by_entity(
    query: str = Query(..., description="Search query for articles"),
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(20, gt=0, le=100, description="Maximum number of articles to return")
):
    articles = opol.articles(query, skip, limit)
    return {"contents": articles}

@router.get("/by_location")
async def articles_by_location(
    query: str = Query(..., description="Search query for articles"),
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(20, gt=0, le=100, description="Maximum number of articles to return")
):
    articles = opol.articles(query, skip, limit)
    return {"contents": articles}
