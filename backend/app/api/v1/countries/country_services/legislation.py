import json
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import xml.etree.ElementTree as ET

api_key = "rgsaY4U.oZRQKUHdJhF9qguHMkwCGIoLaqEcaHjYLF"

def get_legislation_data(state: str):
    api_key = "I9FKdCn.hbfefNWCY336dL6x62vfwNKpoN2RZ1gp21"
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
    response = requests.get(url, headers=headers, params=params)
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
            label = 'red'
        
        results.append({
            'law': item.get('titel'),
            'status': status,
            'label': label,
            'date': item.get('datum')
        })
    
    results.sort(key=lambda x: x['label'])
    
    return results