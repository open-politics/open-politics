from django.shortcuts import render
from django.http import JsonResponse
from news.api_calls import call_with_search_parameters
from news.models import NewsArticle, NewsSource
from django.views.generic import ListView

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
    return render(request, "news/news_button.html")

def news(request):
    return render(request, "news/news_home.html")

class ArticleListView(ListView):
    model = NewsArticle
    template_name = 'news/articles_list.html'
    context_object_name = 'articles'


def news_home(request):
    return render(request, "news/news_home.html")




