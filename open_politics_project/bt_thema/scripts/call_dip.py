# Call DIP Api for x Vorgang

import requests
import json
from django.http import JsonResponse

id = 300959

def get_vorgang(request, id):
    # make request to DIP API
    response = requests.get(f"https://dip.bundestag.de/vorgang/{id}")
    data = response.json()
    
    # if id not already in sqlite Database
    if data['id'] != None and data['typ'] == 'Vorgang':
        # Save to json
        with open('vorgangsdaten_buffer.json', 'w') as outfile:
            json.dump(data, outfile)
    
    return JsonResponse(data)
