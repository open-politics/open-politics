from django.shortcuts import render
from django.http import JsonResponse
from news.api_calls import call_with_search_parameters
from news.models import NewsArticle, NewsSource

# Create your views here.
from django.http import JsonResponse

def fetch_articles_api(request):
    default_options = {
        'country': 'de',
        'q': 'Bundestag',
        'pageSize': 50,
        'page': 1
    }
    articles = call_with_search_parameters(default_options)  
    article_list = [{'title': article['title'], 'url': article['url']} for article in articles]


    # Save articles to DB (similar logic as the management command)

    return JsonResponse({'status': 'success'})

def test_button(request):
    return render(request, "news_button.html")

from django.views.generic import ListView
from news.models import NewsArticle

class ArticleListView(ListView):
    model = NewsArticle
    template_name = 'article_list.html'
    context_object_name = 'articles'
