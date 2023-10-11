from django.shortcuts import render
from django.http import JsonResponse
from news.api_calls import call_with_search_parameters

# Create your views here.
from django.http import JsonResponse

def fetch_articles_api(request):
    articles = call_with_search_parameters()  # or any other logic you want
    # Save articles to DB (similar logic as the management command)

    return JsonResponse({'status': 'success'})

def test_button(request):
    return render(request, "test_button.html")
