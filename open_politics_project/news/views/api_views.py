import os
import json
import logging
import asyncio
import requests
import markdown
import regex

from typing import Literal, Iterable, Optional, List
from pydantic import BaseModel, Field
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django_eventstream import send_event
from django.test import TestCase, RequestFactory

from newsapi import NewsApiClient
from ..models import UserProfile, SearchHistory

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from prefect import task, Flow
import instructor
from openai import OpenAI
import marvin
from marvin import ai_fn

class Law(BaseModel):
    law: str
    status: str

@csrf_exempt
def country_from_query(request):
    query = request.GET.get('query', '')
    print(query)
    country_name = marvin.cast(query, target=str, instructions="Return the country name most relevant to the query.")
    
    # Correct the URL and switch to HTTP if HTTPS is not configured
    response = requests.get(f"http://localhost:3690/call_pelias_api?location={country_name}", verify=False)
    
    if response.status_code == 200:
        coordinates = response.json()
        return JsonResponse({"country_name": country_name, "latitude": coordinates[0], "longitude": coordinates[1]})
    
    return JsonResponse({"error": "Unable to fetch geocoding data"}, status=500)


from bs4 import BeautifulSoup

@csrf_exempt
def get_leaders(request):
    url = "https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government"
    response = requests.get(url, verify=False)
    html_content = response.text

    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', {'class': 'wikitable sortable plainrowheaders sticky-header'})

    leaders = []

    def get_wikipedia_image_url(page_title):
        api_url = f"https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "titles": page_title,
            "prop": "pageimages",
            "pithumbsize": 500
        }
        response = requests.get(api_url, params=params).json()
        pages = response['query']['pages']
        for page_id, page_data in pages.items():
            if 'thumbnail' in page_data:
                return page_data['thumbnail']['source']
        return None

    for row in table.find_all('tr'):
        cells = row.find_all(['th', 'td'])
        if len(cells) >= 3:
            state = cells[0].get_text(strip=True)
            head_of_state = cells[1].get_text(strip=True)
            head_of_government = cells[2].get_text(strip=True)

            head_of_state_name = head_of_state.split('–')[-1].strip()
            head_of_government_name = head_of_government.split('–')[-1].strip()

            head_of_state_image = get_wikipedia_image_url(head_of_state_name)
            head_of_government_image = get_wikipedia_image_url(head_of_government_name)

            leaders.append({
                'State': state,
                'Head of State': head_of_state_name,
                'Head of State Image': head_of_state_image,
                'Head of Government': head_of_government_name,
                'Head of Government Image': head_of_government_image
            })

    return JsonResponse({'leaders': leaders})

@csrf_exempt
def get_leaders(request):
    with open('leaders.json', 'r') as f:
        leaders = json.load(f)
    return JsonResponse({'leaders': leaders})

@csrf_exempt
def get_leader_info(request, state):
    logging.info(f"Received request for state: {state}")
    try:
        with open('open_politics_project/news/static/geo_data/leaders.json', 'r') as f:
            leaders = json.load(f)
            logging.info("Successfully loaded leaders data from JSON file.")
    except FileNotFoundError:
        logging.error("Leaders JSON file not found.")
        return JsonResponse({'error': 'Leaders data file not found'}, status=500)
    except json.JSONDecodeError:
        logging.error("Error decoding JSON data.")
        return JsonResponse({'error': 'Error decoding leaders data'}, status=500)

    for leader in leaders:
        if leader['State'] == state:
            logging.info(f"Found leader information for state: {state}")
            return JsonResponse(leader)
    
    logging.warning(f"State not found: {state}")
    return JsonResponse({'error': 'State not found'}, status=404)

class Law(BaseModel):
    law: str
    status: str

from .countries import germany

def get_legislation_data(request, state):
    print(state)
    if state == "Germany":
        from .countries import germany
        result = germany.get_legislation_data(request, state)
        return JsonResponse(result, safe=False)  # Set safe to False to allow non-dict objects
    else:
        return JsonResponse({'error': 'State not found'}, status=404)

def get_econ_data(request, state):
    state = state
    from .countries import germany
    result = germany.get_econ_data(request, state)
    return JsonResponse(result, safe=False)  # Set safe to False to allow non-dict objects

