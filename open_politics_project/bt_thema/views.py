import requests
import json
from django.http import JsonResponse, request
from django.shortcuts import render
from .models import *

def hi(request):
  return render(request, 'bt_thema/hi.html', {})


def get_vorgang(request, id):
  try:
    vorgang = Vorgang.objects.get(pk=id)
    data = {
      "id": vorgang.id,
      "titel": vorgang.titel, 
      # other fields
    }
    return JsonResponse(data)
  except Vorgang.DoesNotExist:
    return JsonResponse({"error": "Not found"}, status=404)
  
def get_vorgangsposition(request, id):
  try:
    # Similar to get_vorgang
    pass
  except Vorgangsposition.DoesNotExist:
    return JsonResponse({"error": "Not found"}, status=404)
  
def get_drucksache(request, id):
  try:
    # Similar to get_vorgang
    pass
  except Drucksache.DoesNotExist:
    return JsonResponse({"error": "Not found"}, status=404)

def receive_url_api (request, id):
  try:
    vorgang = Vorgang.objects.get(pk=id)
    url = vorgang.url
    headers = {'Content-Type': 'application/json'}
    data = {'url': url}
    response = requests.post('http://5.75.171.173:5001/receive-url', headers=headers, data=json.dumps(data))
    vorgang_data = response.json()
    vorgang.titel = vorgang_data['titel']
    # set other fields from the response data
    vorgang.save()
    return JsonResponse(vorgang_data)
  except Vorgang.DoesNotExist:    return JsonResponse({"error": "Not found"}, status=404)


# Render user/view_process.html template
def process_view(request):
  return render(request, 'bt_thema/user/view_process.html', {})

