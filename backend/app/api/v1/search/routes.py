from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import logging
from enum import Enum
from typing import Optional, Dict, List
import httpx
import json

logger = logging.getLogger(__name__)

router = APIRouter()

class SearchType(str, Enum):
    TEXT = "text"
    SEMANTIC = "semantic"
    STRUCTURED = "structured"

@router.get("/articles", response_model=None)
async def get_articles(
    search_query: Optional[str] = None,
    search_type: SearchType = SearchType.SEMANTIC,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    news_category: Optional[str] = None,
    secondary_categories: Optional[List[str]] = Query(None),  # Ensure this is a list
    keyword: Optional[str] = None,
    entities: Optional[List[str]] = Query(None),  # Ensure this is a list
    locations: Optional[List[str]] = Query(None),  # Ensure this is a list
    topics: Optional[List[str]] = Query(None),  # Ensure this is a list
    classification_scores: Optional[str] = None,
    keyword_weights: Optional[str] = None,  # New parameter for keyword weights
    exclude_keywords: Optional[List[str]] = Query(None),  # Ensure this is a list
):
    try:
        params = {
            "search_query": search_query,
            "skip": skip,
            "limit": limit,
            "search_type": search_type.value,
            "news_category": news_category,
            "secondary_categories": ",".join(secondary_categories) if secondary_categories else None,  # Convert list to comma-separated string
            "keyword": keyword,
            "entities": ",".join(entities) if entities else None,  # Convert list to comma-separated string
            "locations": ",".join(locations) if locations else None,  # Convert list to comma-separated string
            "topics": ",".join(topics) if topics else None,  # Convert list to comma-separated string
            "classification_scores": classification_scores,
            "keyword_weights": keyword_weights,
            "exclude_keywords": ",".join(exclude_keywords) if exclude_keywords else None,  # Convert list to comma-separated string
        }

        async with httpx.AsyncClient() as client:
            response = await client.get("http://postgres_service:5434/articles", params=params)
            response.raise_for_status()
            return JSONResponse(content=response.json(), status_code=200)
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred while fetching articles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch articles")
    except Exception as e:
        logger.error(f"Unexpected error occurred while fetching articles: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")