from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from .services import update_leaders
from .schemas import CountryRequest, CountryResponse, Law
import logging
import json
import requests
import marvin
from pathlib import Path
from typing import List
from .country_services import legislation, economy
import tavily


BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

logging.basicConfig(level=logging.INFO)

router = APIRouter()

@router.get("/country_from_query/")
async def country_from_query(query: str):
    country_name = marvin.cast(query, target=str, instructions="Return the country name most relevant to the query.")

    response = requests.get(f"http://geo_service:3690/call_pelias_api?location={country_name}", verify=False)
    print(response)
    try:
        # return {"country_name": country_name}
        if response.status_code == 200:
            coordinates = response.json()
            return {"country_name": country_name, "latitude": coordinates[0], "longitude": coordinates[1]}
        else:
            raise HTTPException(status_code=response.status_code, detail="Unable to fetch geocoding data")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding geocoding data")

@router.get("/geojson/")
async def geojson_view():
    geojson_file_path = BASE_DIR / 'static' / 'geo_data' / 'articles.geojson'
    try:
        with open(geojson_file_path, 'r') as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="GeoJSON file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding GeoJSON data")

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
    

