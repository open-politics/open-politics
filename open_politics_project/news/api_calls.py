# This Script calls the News API and returns a list of articles
# All functions are api calling scripts + some helper functions to put them together

import requests
import os

api_key = os.environ.get('NEWS_API_KEY')
url = 'https://newsapi.org/v2/top-headlines'

def call_with_search_parameters():
    call_parameters = {
        'country': 'us',
        'query': 'Bundestag'
    }
    response = requests.get(url, params=call_parameters, headers={'Authorization': f'Bearer {api_key}'})

    articles = response.json()['articles']
    return articles


def call_with_source_parameters():
    




