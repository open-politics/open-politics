from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import logging
import requests
from typing import List
from enum import Enum
from typing import Optional
from pathlib import Path
from sentinelsat import SentinelAPI
from datetime import date, timedelta

# Configure logging with a higher level of detail
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

import os

def get_coordinates(location: str):
    try:
        result = requests.get(
            f"http://api.opol.io/geo-service/geocode_location?location={location}&language={language}", 
            verify=False
        )
        logger.info(f"Result: {result.json()}")
        if result.status_code == 200:
            data = result.json()
            coordinates = data.get('coordinates')
            if coordinates and len(coordinates) == 2:
                return {
                    "location": location,
                    "longitude": coordinates[0],
                    "latitude": coordinates[1],
                    "bbox": data.get('bbox'),  # Include bbox if available
                    "location_type": data.get('location_type', 'locality')  # Include location type
                }
        
        raise HTTPException(status_code=404, detail="Coordinates not found for the given location")
    except Exception as e:
        logger.error(f"Error fetching coordinates for location {location}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Update the constants for Dataspace
# Temporarily deleted code