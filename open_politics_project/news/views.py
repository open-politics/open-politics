from news.models import NewsArticle, NewsSource
from django.views.generic import ListView
from django.http import FileResponse
from django.shortcuts import render
from django.http import JsonResponse
from news.api_calls import call_with_search_parameters

import io
import openai
import os
import sys
import requests
import pandas as pd


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



def get_image(request):
    image_url = visualize_entity_article_connections()
    return render(request, 'image_template.html', {'image_url': image_url})


def get_news_data(query, pageSize=40, sources_choice=None):
    print("fetching news data")
    if sources_choice == 'all' or sources_choice is None:
        sources = None
    elif sources_choice == 'trusted':
        sources = 'bbc-news, the-wall-street-journal, the-washington-post, the-new-york-times, the-hill, the-guardian-uk, politico, al-jazeera-english, dw'
    
    api_key = os.environ.get('NEWS_API_KEY')
    url = 'https://newsapi.org/v2/top-headlines'

    call_parameters = {
        'q': query,
        'pageSize': pageSize,
        'sources': sources
    }
    # Filter out None values to prevent sending empty parameters
    call_parameters = {k: v for k, v in call_parameters.items() if v is not None}

    response = requests.get(url, params=call_parameters, headers={'Authorization': f'Bearer {api_key}'})

    if response.status_code == 200:
        json_data = response.json()
        if 'articles' in json_data:
            articles = json_data['articles']
            df = pd.DataFrame(articles, columns=['source', 'author', 'title', 'description', 'url', 'urlToImage', 'publishedAt', 'content'])
            
            for article in articles:
                source = article.get('source', {}).get('name', None)
                title = article.get('title')
                content = article.get('content')
                if not title or not content:
                    print(f"Warning: Missing title or content in article {article['title']}")
                    continue
                # print(f"Source: {source}")
                # print(f"Title: {title}")
                # print(f"Content: {content}")
                # print("-" * 50)  # Print a separator for better readability
    print("news_fetched")
    return df


def generate_synopsis(topic, df):
    print("generate_synopsis")
    template = "These following are the most important news articles about {topic} from the last 24 hours. Please provide a balanced synopsis of the topic and the related news"
        # concentate articles into one string
        
    articles = []
    for index, row in df.iterrows():
        articles.append(row['title'])
    articles = ' '.join(articles)


    openai.api_key = os.getenv("OPENAI_API_KEY")
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages = [{"role": "system", "content": 'You are a political news journalist tasked with Named Entity Recognition and Entity linking tasks.'},
                    {"role": "user", "content": "These following are the articles about" + topic + "from the last 24 hours. Please give a short summary about what is important right now to know about this matter. No more than 10 sentences and just the plain answer." },
                    {"role": "assistant", "content" : "Ok, show me the articles please" },
                    {"role": "user", "content": "Here are the articles:\n" + articles }],
        stream=False,
                                                                                                        )
    result = response.choices[0]['message']['content']
    print("synopsis generated")
    print(len(result))
    return result


# def stream_synopsis(request):
#     print("stream_synopsis")
#     query = request.GET.get('query', None)  # Get the query from the GET parameters

#     if not query:  # Check if the query is provided
#         return render(request, 'news/synopsis.html', {})

#     df = get_news_data(query)  # Fetch articles related to the query

#     synopsis = generate_synopsis(query, df)  # Generate the synopsis using OpenAI


#     return render(request, 'news/synopsis.html', {'synopsis': synopsis})


# Fake synpopsis to save costs
def stream_synopsis(request):
    print("stream_synopsis")
    query = request.GET.get('query', None)  # Get the query from the GET parameters

    # if not query:  # Check if the query is provided
    #     return render(request, 'news/news_home.html', {})

    # df = get_news_data(query)  # Fetch articles related to the query

    # synopsis = generate_synopsis(query, df)  # Generate the synopsis using OpenAI


    # return render(request, 'news/synopsis.html', {'synopsis': synopsis})
    return render(request, 'news/synopsis.html', {'synopsis': 'Test synopsis'*50})










# def stream_articles(request):
#     print("stream_articles")
#     query = request.GET.get('query', None)  # Get the query from the GET parameters

#     if not query:  # Check if the query is provided
#         return render(request, 'news/news_home.html', {})

#     df = get_news_data(query)  # Fetch articles related to the query

#     #synopsis = generate_synopsis(query, df)  # Generate the synopsis using OpenAI


#     #return render(request, 'news/news_home.html', {'synopsis': synopsis})
#     return render(request, 'news/articles_list.html', {'articles': df})