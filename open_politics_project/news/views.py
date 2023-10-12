from django.shortcuts import render
import networkx as nx
from django.http import JsonResponse
from news.api_calls import call_with_search_parameters
import matplotlib.pyplot as plt
import io
from news.models import NewsArticle, NewsSource
from django.views.generic import ListView
from django.http import FileResponse

import matplotlib
matplotlib.use('Agg')


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


def visualize_entity_article_connections(article):
    # Sample entities (In a real use-case, you would dynamically extract entities from your articles or use some external service)
    entities = [
        {'word': 'Israel', 'score': 0.85},
        {'word': 'Gaza', 'score': 0.61}
    ]

    # Fetch articles from the database
    articles_data = NewsArticle.objects.all()[:10]  # Fetching first 10 articles, you can adjust this as per your requirements
    articles = [article.title for article in articles_data]

    G = nx.Graph()

    # (rest of the function as before to generate the visualization...)

    # Save figure to a BytesIO object
    buf = io.BytesIO()
    plt.savefig(buf, format="PNG")
    buf.seek(0)

    return FileResponse(buf, as_attachment=True, filename='network_graph.png')



def get_image(request):
    image_url = visualize_entity_article_connections()
    return render(request, 'image_template.html', {'image_url': image_url})
