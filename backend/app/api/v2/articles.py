import os
from opol import OPOL
from fastapi import APIRouter, Query
from typing import Optional, List, Dict
from pydantic import BaseModel

opol = OPOL(mode="container", api_key=os.getenv("OPOL_API_KEY", ""))

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
    return {"articles": articles}

@router.get("/by_entity", response_model=ArticleResponse)
async def articles_by_entity(
    query: str = Query(..., description="Search query for articles"),
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(20, gt=0, le=100, description="Maximum number of articles to return")
):
    articles = opol.articles(query, skip, limit)
    return {"articles": articles}

@router.get("/by_location")
async def articles_by_location(
    query: str = Query(..., description="Search query for articles"),
    skip: int = Query(0, ge=0, description="Number of articles to skip"),
    limit: int = Query(20, gt=0, le=100, description="Maximum number of articles to return")
):
    articles = opol.articles(query, skip, limit)
    rerank_query = f"This article talks about Politics in {query}."

    texts = [article["title"][:300] for article in articles]
    reranked_articles_indexes = opol.embeddings.rerank(rerank_query, texts, lean=True)

    # Tuple: {'content': 'Magdeburg [...] – DW – 12', 'similarity': array([0.65913154]), 'index': 9}   
    # if lean=True, only:
    # {
    # "articles": [
    #     9,
    #     6,
    # ]
    # }
    # # resort locally

    reranked_articles = [articles[i] for i in reranked_articles_indexes]
    return {"contents": reranked_articles}

