from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import logging
from enum import Enum
from typing import Optional, Dict
import httpx
import json
import requests
from fastapi import Request


logger = logging.getLogger(__name__)

router = APIRouter()

class SearchType(str, Enum):
    TEXT = "text"
    SEMANTIC = "semantic"

@router.get("/articles", response_model=None)
async def get_articles(
    search_query: str,
    search_type: SearchType = SearchType.SEMANTIC,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    try:
        params = {
            "search_query": search_query,
            "skip": skip,
            "limit": limit,
            "search_type": search_type.value, 
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

@router.get("/dashboard_articles", response_model=None)
async def get_dashboard_articles(
    search_type: SearchType = SearchType.TEXT,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = "geopolitical_relevance",
    sort_order: str = "desc",
    filters: Optional[str] = None
):
    try:
        params = {
            "search_type": search_type.value,
            "skip": skip,
            "limit": limit,
            "sort_by": sort_by,
            "sort_order": sort_order,
        }

        if filters:
            filters_dict = json.loads(filters)
            # Instead of updating params directly, set a separate 'filters' parameter
            params["filters"] = json.dumps(filters_dict)

        async with httpx.AsyncClient() as client:
            response = await client.get("http://postgres_service:5434/articles", params=params)
            response.raise_for_status()
            return JSONResponse(content=response.json(), status_code=200)
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred while fetching dashboard articles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard articles")
    except Exception as e:
        logger.error(f"Unexpected error occurred while fetching dashboard articles: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")