from opol import OPOL
import os
from fastapi import APIRouter, HTTPException, Query
import requests
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

opol = OPOL(mode=os.getenv("OPOL_MODE"), api_key=os.getenv("OPOL_API_KEY"))
# opol = OPOL(mode="container", api_key=os.getenv("OPOL_API_KEY"))

@router.get("/geojson_events")
async def geojson_events_view(event_type: str = Query(...)):
    try:
        geojson_data = opol.geo.json_by_event(event_type)
        if not geojson_data:
            logger.warning(f"No GeoJSON data returned for event_type: {event_type}")
            raise HTTPException(status_code=404, detail="No GeoJSON data found for the specified event type.")
        
        # Optionally, validate the GeoJSON structure here
        return geojson_data
    except Exception as e:
        logger.error(f"Error fetching GeoJSON data for event type '{event_type}': {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching GeoJSON data.")