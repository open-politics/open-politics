# This Script calls the News API and returns a list of articles
# All functions are api calling scripts + some helper functions to put them together

import requests
import os
from news.models import NewsArticle, NewsSource

api_key = os.environ.get('NEWS_API_KEY')
url = 'https://newsapi.org/v2/top-headlines'


# Article fetcher helper function
# can be called from the Django commandline with:
# python manage.py populate_articles --country=de --q="Bundestag" --pageSize=50 --page=1
def call_with_search_parameters(options):
    call_parameters = {
        'country': options.get('country'),
        'category': options.get('category'),
        'sources': options.get('sources'),
        'q': options.get('q'),
        'pageSize': options.get('pageSize', 20),
        'page': options.get('page', 1)
    }
    # Filter out None values to prevent sending empty parameters
    call_parameters = {k: v for k, v in call_parameters.items() if v is not None}

    response = requests.get(url, params=call_parameters, headers={'Authorization': f'Bearer {api_key}'})
    if response.status_code == 200:
        json_data = response.json()
        if 'articles' in json_data:
            articles = json_data['articles']
            for article in articles:
                NewsArticle.objects.create(
                    title=article['title'],
                    description=article['description'],
                    url=article['url'],
                    url_to_image=article['urlToImage'],
                    published_at=article['publishedAt'],
                    content=article['content'],
                    source=NewsSource.objects.get_or_create(
                        name=article['source']['name'],
                        url=article['source']['url']
                    )[0]
                )
            return articles
        else:
            print("Unexpected API response:", json_data)
            return []
    else:
        print("API call failed with status code:", response.status_code)
        print("Response text:", response.text)
        return []


def get_all_sources(language=None):
    source_url = 'https://newsapi.org/v2/top-headlines/sources'
    params = {'language': language} if language else {} and {'country': 'de'} if language == 'de' else {}
    response = requests.get(source_url, headers={'Authorization': f'Bearer {api_key}'}, params=params)
    return response.json()['sources']

# Get all news sources 
# --> sources = get_all_sources()
# Get German news sources only 
# --> sources_de = get_all_sources(language='de')
