import logging
from typing import Union
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import requests
import marvin
from api.v1.countries.routes import router as country_router
from api.v1.search.routes import router as search_router


app = FastAPI(redirect_slashes=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(country_router, prefix="/api/v1/countries", tags=["Country"])
app.include_router(search_router, prefix='/api/v1/search', tags=["Search"])

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
async def read_root():
    return {"Hello": "Whatsup"}
    