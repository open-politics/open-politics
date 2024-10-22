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

@router.get("/{location}/contents", response_model=None)
async def get_location_contents(
    location: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search_query: Optional[str] = None,
    search_type: SearchType = SearchType.SEMANTIC,
):
    try:
        result = await articles.get_contents(
            location, skip, limit, search_query, search_type.value
        )
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        logger.error(f"Error fetching contents: {str(e)}")
        return JSONResponse(content={'error': 'Failed to fetch contents'}, status_code=500)

@router.get("/location_from_query")
async def location_from_query(query: str):
    location = requests.get(f"http://classification_service:5688/location_from_query?query={query}", verify=False)
    location = location.json()
    print(location)

    response = requests.get(f"http://geo_service:3690/geocode_location?location={location}", verify=False)
    print(response.json())
    try:
        if response.status_code == 200:
            coordinates = response.json()['coordinates']
            return {"location": location, "longitude": coordinates[0], "latitude": coordinates[1]}
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

@router.get("/{location_name}/entities", response_model=None)
async def get_location_entities(location_name: str, skip: int = 0, limit: int = 50):
    try:
        response = requests.get(f"http://postgres_service:5434/location_entities/{location_name}?skip={skip}&limit={limit}")
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

@router.get("/get_coordinates/")
async def get_coordinates(location: str, language: str = "en"):
    """
    Fetches the coordinates (longitude, latitude) for a given location.
    """
    try:
        result = requests.get(f"http://geo_service:3690/geocode_location?location={location}&language={language}", verify=False)
        logger.info(f"Result: {result.json()}")
        if result.status_code == 200:
            data = result.json()
            coordinates = data.get('coordinates')
            if coordinates:
                return {"location": location, "longitude": coordinates[0], "latitude": coordinates[1]}
        else:
            raise HTTPException(status_code=404, detail="Coordinates not found for the given location")
    except Exception as e:
        logger.error(f"Error fetching coordinates for location {location}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/get_geojson_for_article_ids")
async def get_geojson_for_article_ids(article_ids: List[str]):
    # Ensure article_ids are strings
    article_ids = [str(article_id) for article_id in article_ids]
    
    # Log the payload for debugging
    logger.debug(f"Sending article_ids: {article_ids}")

    # Send the request with the correct headers
    geojson_data = requests.post(
        "http://geo_service:3690/geojson_by_article_ids",
        json=article_ids, 
        headers={"Content-Type": "application/json"},
        verify=False
    )
    
    if geojson_data.status_code == 200:
        return JSONResponse(content=geojson_data.json(), status_code=200)
    else:
        logger.error(f"Failed to fetch GeoJSON data: {geojson_data.text}")
        raise HTTPException(status_code=geojson_data.status_code, detail="Unable to fetch GeoJSON data")
