from opol import OPOL
import os
from fastapi import APIRouter, HTTPException, Query
import requests

router = APIRouter()

os.environ["OPOL_MODE"] = "remote"

opol = OPOL(mode="remote", api_key=os.environ["OPOL_API_KEY"])

@router.get("/geojson_events")
async def geojson_events_view(event_type: str = Query(...)):
    response = opol.geo.json_by_event(event_type)
    if response.get('status_code') == 200:
        return response
    else:
        raise HTTPException(status_code=response.get('status_code', 500), detail="Unable to fetch events GeoJSON data")
