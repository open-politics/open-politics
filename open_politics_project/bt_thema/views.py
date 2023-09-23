from django.shortcuts import render

# Create your views here.
# views.py

from django.http import JsonResponse
from .models import Vorgang, Vorgangsposition, Drucksache

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
  # Similar to get_vorgang
  
def get_drucksache(request, id):
  # Similar to get_vorgang