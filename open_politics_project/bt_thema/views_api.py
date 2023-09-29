from django.http import JsonResponse, HttpResponseBadRequest
from .models import Vorgang
import requests
import os

def get_vorgang(request, id, admin_mode=False):
    """Fetch data from the DIP API based on a given ID and save it to the database."""
    
    # Define API endpoint and headers
    url = f"https://search.dip.bundestag.de/api/v1/vorgang/{id}?format=json"
    headers = {
        'accept': 'application/json',
        'apikey': os.environ.get("DIP_API_KEY")
    }
    
    # Make request to DIP API
    response = requests.get(url, headers=headers)
    
    # Handle possible request errors
    if response.status_code != 200:
        if admin_mode:
            return "Error fetching data from DIP API"
        else:
            return HttpResponseBadRequest("Error fetching data from DIP API")

    data = response.json()

    # Check if the returned data is of the right type and contains an ID
    if data.get('id') and data.get('typ') == 'Vorgang':
        # Check if this Vorgang doesn't already exist in our database
        if not Vorgang.objects.filter(id=int(data['id'])).exists():
            vorgang_instance = Vorgang(
                id=int(data['id']),
                beratungsstand=data['beratungsstand'],
                vorgangstyp=data['vorgangstyp'],
                wahlperiode=data['wahlperiode'],
                initiative=", ".join(data['initiative']),
                datum=data['datum'],
                aktualisiert=data['aktualisiert'],
                titel=data['titel'],
                abstract=data['abstract'],
                sachgebiet=", ".join(data['sachgebiet']),
                deskriptor=", ".join([d['name'] for d in data['deskriptor']]),
                gesta=data['gesta'],
                zustimmungsbeduerftigkeit=", ".join(data['zustimmungsbeduerftigkeit'])
                # Add other fields as necessary
            )
            vorgang_instance.save()
            if admin_mode:
                return f"Data fetched and saved for Vorgang with ID: {id}"
    
    if admin_mode:
        return "Data was not of type 'Vorgang' or lacked an ID."
    else:
        return JsonResponse(data)


