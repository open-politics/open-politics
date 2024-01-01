import json
from django.http import JsonResponse, request
from django.shortcuts import render
from news.models import NewsArticle, NewsSource

def home(request):
    articles = NewsArticle.objects.all()
    context = {
        'articles': articles
    }
    return render(request, 'home.html', context)

def news_home(request):
    articles = NewsArticle.objects.all()
    context = {
        'articles': articles,
        'range_20': range(20)
    }
    return render(request, 'news/news_home.html', context=context)
