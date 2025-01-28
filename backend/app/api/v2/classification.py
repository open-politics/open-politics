from opol import OPOL
from fastapi import APIRouter, Query
from typing import Optional, List
from pydantic import BaseModel
import os

opol = OPOL(mode=os.getenv("OPOL_MODE", "container"), api_key=os.getenv("OPOL_API_KEY", ""))

router = APIRouter()


class RequestClassification(BaseModel):
    """
    Query to get the classification of the query
    """
    query: str

@router.get("/location_from_query")
async def get_location_from_query(query: str):
    
    class QueryLocation(BaseModel):
        """
        Location most relevant to the query
        """
        location: str

    api_key = os.environ["GOOGLE_API_KEY"]
    
    fastclass = opol.classification(provider="Google", model_name="models/gemini-1.5-flash-latest", llm_api_key=api_key)

    location = fastclass.classify(QueryLocation, "Location most relevant to the query", query)

    return location