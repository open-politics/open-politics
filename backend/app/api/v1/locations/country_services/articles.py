import httpx
import logging
from fastapi import HTTPException
from typing import Optional, List
from enum import Enum

logger = logging.getLogger(__name__)

class SearchType(str, Enum):
    TEXT = "text"
    SEMANTIC = "semantic"

async def get_articles(
    location: str,
    skip: int = 0,
    limit: int = 20,
    search_query: Optional[str] = None,
    search_type: SearchType = SearchType.TEXT,
):
    try:
        params = {
            "search_query": f"{location} {search_query}" if search_query else location,
            "skip": skip,
            "limit": limit,
            "search_type": search_type.value,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get("http://postgres_service:5434/articles", params=params)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred while fetching articles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch articles")
    except Exception as e:
        logger.error(f"Unexpected error occurred while fetching articles: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")