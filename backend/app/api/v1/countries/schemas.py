# schemas.py
from pydantic import BaseModel

class CountryRequest(BaseModel):
    query: str

class CountryResponse(BaseModel):
    country_name: str
    latitude: float
    longitude: float

class Law(BaseModel):
    law: str
    status: str