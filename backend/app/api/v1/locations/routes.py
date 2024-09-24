from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse
from fastapi.responses import StreamingResponse
from .services import update_leaders
from .schemas import CountryRequest, CountryResponse, Law
import logging
import json
import requests
import marvin
from pathlib import Path
from typing import List
from .country_services import legislation, economy
from .country_services import articles
import tavily
from enum import Enum
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
class SearchType(str, Enum):
    TEXT = "text"
    SEMANTIC = "semantic"

@router.get("/{location}/articles", response_model=None)
async def get_location_articles(
    location: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search_query: Optional[str] = None,
    search_type: SearchType = SearchType.TEXT,
    has_geocoding: Optional[bool] = Query(None),
    has_entities: Optional[bool] = Query(None),
    has_classification: Optional[bool] = Query(None),
    has_embeddings: Optional[bool] = Query(None),
):
    try:
        result = await articles.get_articles(
            location, skip, limit, search_query, search_type.value,
            has_geocoding, has_entities, has_classification, has_embeddings
        )
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching articles: {str(e)}")
        return JSONResponse(content={'error': 'Failed to fetch articles'}, status_code=500)

@router.get("/country_from_query/")
async def country_from_query(query: str):
    country_name = marvin.cast(query, target=str, instructions="Return the country name most relevant to the query.")

    response = requests.get(f"http://geo_service:3690/call_pelias_api?location={country_name}", verify=False)
    print(response)
    try:
        if response.status_code == 200:
            coordinates = response.json()
            return {"country_name": country_name, "latitude": coordinates[0], "longitude": coordinates[1]}
        else:
            raise HTTPException(status_code=response.status_code, detail="Unable to fetch geocoding data")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding geocoding data")

@router.get("/geojson/")
async def geojson_view():
    request = requests.get("http://geo_service:3690/geojson", verify=False)
    if request.status_code == 200:
        return request.json()
    else:
        raise HTTPException(status_code=request.status_code, detail="Unable to fetch GeoJSON data")

@router.get("/geojson_events")
async def geojson_events_view(event_type: str = Query(...)):
    request = requests.get(f"http://geo_service:3690/geojson_events/{event_type}", verify=False)
    if request.status_code == 200:
        return request.json()
    else:
        raise HTTPException(status_code=request.status_code, detail="Unable to fetch events GeoJSON data")

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_view():
    try:
        # Update the URL to point to the correct service name or IP address
        request = requests.get("http://main_core_app:8089/", verify=False)
        request.raise_for_status()  # Raise an exception for HTTP errors
        
        # Return the raw HTML content
        return HTMLResponse(content=request.text, status_code=200)
    except requests.RequestException as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        raise HTTPException(status_code=request.status_code, detail="Unable to fetch dashboard data")

@router.get("/entities/{state}", response_model=None)
async def get_location_entities(state: str, skip: int = 0, limit: int = 50):
    try:
        response = requests.get(f"http://postgres_service:5434/location_entities/{state}?skip={skip}&limit={limit}")
        response.raise_for_status()
        return JSONResponse(content=response.json(), status_code=200)
    except requests.RequestException as e:
        logger.error(f"Error fetching location entities: {str(e)}")
        return JSONResponse(content={'error': 'Failed to fetch location entities'}, status_code=500)

@router.get("/leaders/{state}")
async def get_leader_info(state: str):
    leaders_file_path = BASE_DIR / 'static' / 'country_data' / 'leaders.json'
    try:
        with open(leaders_file_path, 'r') as f:
            leaders = json.load(f)
        for leader in leaders:
            if leader['State'] == state:
                return leader
        raise HTTPException(status_code=404, detail="State not found")
    except FileNotFoundError:
        logging.error(f"Leaders JSON file not found at {leaders_file_path}")  
        raise HTTPException(status_code=404, detail="Leaders file not found")
    except json.JSONDecodeError:
        logging.error("Error decoding JSON data.")
        raise HTTPException(status_code=500, detail="Error decoding leaders data")

@router.get("/legislation/{state}", response_model=None)
async def get_legislation_data(state: str):
    if state == "Germany":
        result = legislation.get_legislation_data(state)
        return JSONResponse(content=result, status_code=200)
    else:
        return JSONResponse(content={'error': 'State not found'}, status_code=404)

@router.get("/econ_data/{state}", response_model=None)
async def get_econ_data(state: str, indicators: List[str] = Query(["GDP", "GDP_GROWTH"])):
    result = await economy.get_econ_data(state, indicators)
    return JSONResponse(content=result, status_code=200)

@router.get("/update_leaders/")
async def update_leaders():
    logging.info("Updating leaders data...")
    update_leaders()
    return {"message": "Leaders data updated successfully."}

@router.get("/get_articles", response_model=None)
async def get_tavily_data():
    result = tavily.get_tavily_data()
    return JSONResponse(content=result, status_code=200)