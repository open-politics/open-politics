import httpx
import logging
from fastapi import HTTPException
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SearchType(str, Enum):
    TEXT = "text"
    SEMANTIC = "semantic"
    LOCATION = "location"
    LOCATION_WITH_TEXT = "location_with_text"

async def get_contents(
    location: str,
    skip: int = 0,
    limit: int = 20,
    search_query: Optional[str] = None,
    search_type: SearchType = SearchType.LOCATION,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    content_type: Optional[str] = None,
    min_relevance: float = 0.0
):
    try:
        # Build base params
        params = {
            "skip": skip,
            "limit": limit,
            "sort_by": "relevance_score",
            "sort_order": "desc"
        }

        # Add date filters if provided
        if date_from:
            params["date_from"] = date_from
        if date_to:
            params["date_to"] = date_to
        
        # Add content type filter if provided
        if content_type:
            params["content_type"] = content_type

        # Add minimum relevance score filter
        params["min_relevance"] = min_relevance

        # Different endpoint based on search type
        if search_type == SearchType.LOCATION:
            endpoint = f"https://api.opol.io/postgres_service/contents_by_location/{location}"
        elif search_type == SearchType.LOCATION_WITH_TEXT:
            endpoint = "https://api.opol.io/postgres_service/contents"
            params.update({
                "locations": location,
                "search_query": search_query,
                "search_type": "TEXT"
            })
        else:
            raise HTTPException(status_code=400, detail="Invalid search type")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(endpoint, params=params)
            response.raise_for_status()
            
            contents = response.json()
            
            # Add metadata and statistics
            result = {
                "location": location,
                "total_results": len(contents),
                "skip": skip,
                "limit": limit,
                "search_type": search_type,
                "query_params": {
                    "date_from": date_from,
                    "date_to": date_to,
                    "content_type": content_type,
                    "min_relevance": min_relevance
                },
                "contents": contents,
                "statistics": calculate_statistics(contents)
            }

            logger.info(f"Retrieved {len(contents)} articles for location '{location}'")
            return result

    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred while fetching contents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch contents")
    except Exception as e:
        logger.error(f"Unexpected error occurred while fetching contents: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

def calculate_statistics(contents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate statistics about the retrieved contents"""
    try:
        total_articles = len(contents)
        avg_relevance = sum(c.get('relevance_metrics', {}).get('relevance_score', 0) 
                          for c in contents) / total_articles if total_articles > 0 else 0
        
        sources = {}
        dates = []
        
        for content in contents:
            # Count sources
            source = content.get('source')
            if source:
                sources[source] = sources.get(source, 0) + 1
            
            # Collect dates for time distribution
            date_str = content.get('insertion_date')
            if date_str:
                dates.append(datetime.fromisoformat(date_str.replace('Z', '+00:00')))
        
        return {
            "total_articles": total_articles,
            "average_relevance": round(avg_relevance, 3),
            "source_distribution": sources,
            "date_range": {
                "earliest": min(dates).isoformat() if dates else None,
                "latest": max(dates).isoformat() if dates else None
            }
        }
    except Exception as e:
        logger.error(f"Error calculating statistics: {e}")
        return {}