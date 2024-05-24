import json
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import xml.etree.ElementTree as ET

api_key = "rgsaY4U.oZRQKUHdJhF9qguHMkwCGIoLaqEcaHjYLF"

def get_legislation_data(request, state):
    # Assume there is a mapping of country names to specific API endpoints
    print("Search for legislation data")
    endpoints = {
        "Germany": "https://search.dip.bundestag.de/api/v1/vorgang",
    }
    
    url = endpoints.get(state)
    if not url:
        raise ValueError(f"No endpoint found for country: {state}")

    params = {
        "apikey": api_key,
    }
    headers = {
        "Content-Type": "application/json",
    }
    retries = Retry(total=5, backoff_factor=0.1, status_forcelist=[500, 502, 503, 504])
    session = requests.Session()
    session.mount('https://', HTTPAdapter(max_retries=retries))
    
    response = session.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    data = response.json()
    results = []
    
    for item in data.get('documents', []):
        status = item.get('stand')
        if status == 'Nicht beantwortet':
            label = 'yellow'
        elif status == 'Beantwortet':
            label = 'green'
        else:
            label = 'red'  # Default label for unknown statuses
        
        results.append({
            'law': item.get('titel'),
            'status': status,
            'label': label,
            'date': item.get('datum')
        })
    
    # Sort results by label
    results.sort(key=lambda x: x['label'])
    
    return results

import requests
from django.http import JsonResponse
import xml.etree.ElementTree as ET
import sdmx

def get_econ_data(request, state):
    country_to_iso = {
        "Argentina": "ARG",
        "Australia": "AUS",
        "Austria": "AUT",
        "Bangladesh": "BGD",
        "Belgium": "BEL",
        "Brazil": "BRA",
        "Canada": "CAN",
        "Chile": "CHL",
        "China": "CHN",
        "Colombia": "COL",
        "Czech Republic": "CZE",
        "Denmark": "DNK",
        "Egypt": "EGY",
        "Finland": "FIN",
        "France": "FRA",
        "Germany": "DEU",
        "Ghana": "GHA",
        "Greece": "GRC",
        "Hungary": "HUN",
        "Iceland": "ISL",
        "India": "IND",
        "Indonesia": "IDN",
        "Ireland": "IRL",
        "Israel": "ISR",
        "Italy": "ITA",
        "Japan": "JPN",
        "Malaysia": "MYS",
        "Mexico": "MEX",
        "Netherlands": "NLD",
        "New Zealand": "NZL",
        "Nigeria": "NGA",
        "Norway": "NOR",
        "Pakistan": "PAK",
        "Philippines": "PHL",
        "Poland": "POL",
        "Portugal": "PRT",
        "Romania": "ROU",
        "Russia": "RUS",
        "Saudi Arabia": "SAU",
        "Singapore": "SGP",
        "Slovakia": "SVK",
        "South Africa": "ZAF",
        "South Korea": "KOR",
        "Spain": "ESP",
        "Sweden": "SWE",
        "Switzerland": "CHE",
        "Thailand": "THA",
        "Turkey": "TUR",
        "Ukraine": "UKR",
        "United Arab Emirates": "ARE",
        "United Kingdom": "GBR",
        "United States": "USA",
        "Vietnam": "VNM"
    }
    
    
    iso_code = country_to_iso.get(state)
    if not iso_code:
        raise ValueError(f"No ISO code found for country: {state}")
    
    url = f'https://sdmx.oecd.org/public/rest/data/OECD.SDD.NAD,DSD_NAAG@DF_NAAG_I,1.0/A.{iso_code}.B1GQ+B1GQ_R_GR..?startPeriod=2000&dimensionAtObservation=AllDimensions'
    headers = {
        'Accept': 'application/vnd.sdmx.data+json; charset=utf-8; version=1.0'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        observations = data['data']['dataSets'][0]['observations']
        time_periods = data['data']['structure']['dimensions']['observation'][5]['values']
        
        formatted_data = []
        for i, period in enumerate(time_periods):
            gdp = observations.get(f'0:0:0:0:0:{i}', [None])[0]
            gdp_growth_rate = observations.get(f'0:0:1:1:0:{i}', [None])[0]
            if gdp is not None and gdp_growth_rate is not None:
                formatted_data.append({
                    'name': period['name'],
                    'gdp': gdp,
                    'gdp_growth_rate': gdp_growth_rate
                })
        
        return formatted_data
    else:
        print("Failed to retrieve data:", response.status_code)
        return []