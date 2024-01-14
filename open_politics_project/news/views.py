import sys
from pathlib import Path

from news.models import NewsArticle, NewsSource
from django.http import StreamingHttpResponse
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema import SystemMessage, ChatMessage
from langchain.schema.runnable import RunnableParallel, RunnablePassthrough

from langchain.callbacks.base import BaseCallbackHandler
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
import logging
import time
from queue import Queue
import threading
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt


logger = logging.getLogger(__name__)


def news_home(request):
    return render(request, "news/news_home.html", {'range_20': range(20)})


def news(request):
    return render(request, "news/news_home.html", {'range_20': range(20)})

def tools(request):
    return render(request, "news/hero_tools.html")

class ArticleListView(ListView):
    model = NewsArticle
    template_name = 'news/articles_list.html'
    context_object_name = 'articles'

# ############################################################################################################
### News 

## Helper functions

# News from the last 24 hours
# def get_news_data(query, pageSize=40, sources_choice=None):
#     sources_choice = 'all'
#     if sources_choice == 'all' or sources_choice is None:
#         sources = None
#     elif sources_choice == 'trusted':
#         sources = 'bbc-news, the-wall-street-journal, the-washington-post, the-new-york-times, the-hill, the-guardian-uk, politico, al-jazeera-english, dw'
    
#     api_key = os.environ.get('NEWS_API_KEY')
#     url = 'https://newsapi.org/v2/top-headlines'

#     call_parameters = {
#         'q': query,
#         'pageSize': pageSize,
#         'sources': sources
#     }
#     # Filter out None values to prevent sending empty parameters
#     call_parameters = {k: v for k, v in call_parameters.items() if v is not None}

#     response = requests.get(url, params=call_parameters, headers={'Authorization': f'Bearer {api_key}'})

#     # Initialize df as an empty DataFrame at the start
#     df = pd.DataFrame()

#     if response.status_code == 200:
#         json_data = response.json()
#         if 'articles' in json_data:
#             articles = json_data['articles']
#             df = pd.DataFrame(articles, columns=['source', 'author', 'title', 'description', 'url', 'urlToImage', 'publishedAt', 'content'])
            
#             for article in articles:
#                 source = article.get('source', {}).get('name', None)
#                 title = article.get('title')
#                 content = article.get('content')
#                 if not title or not content:
#                     print(f"Warning: Missing title or content in article {article['title']}")
#                     continue
#     print(df)
#     return df
from django.shortcuts import render

# def get_news_data_view(request):
#     if request.method == 'POST':
#         query = request.POST.get('query')
#         news_data = get_news_data(query)
#         return render(request, 'news_data.html', {'news_data': news_data})

# Helper function to generate a list of Wikipedia summaries for a list of actors
def generate_wikipedia_summaries(actors_string):
    # Split the actors_string by newline characters and strip spaces
    actors = [actor.strip() for actor in actors_string.split('\n') if actor.strip()]
    
    actor_summaries = []
    
    for actor in actors:
        summary = get_wikipedia_summary(actor)
        actor_summaries.append({
            'name': actor,
            'summary': summary
        })


    return actor_summaries

# Wikipedia API Request
def get_wikipedia_summary(actor_name):
    endpoint = "https://en.wikipedia.org/w/api.php"
    parameters = {
        "action": "query",
        "format": "json",
        "prop": "extracts",
        "exintro": True,
        "titles": actor_name
    }
    
    response = requests.get(endpoint, params=parameters)
    data = response.json()

    pages = data["query"]["pages"]
    for page_id, page_content in pages.items():
        return page_content.get("extract", "")

import sys
from pathlib import Path

from django.http import JsonResponse

from test_scripts import extract_news_content

def ner_api(request):
    if request.method == 'POST':
        ner_query = request.POST.get('ner_query')
        if ner_query is None:
            return JsonResponse({'error': 'No NER query provided'})

        result = extract_news_content(ner_query)

        # Check if it's an htmx request
        if 'HX-Request' in request.headers:
            return render(request, 'news/ner_result.html', {'result': result})
        
        return JsonResponse({'result': result})
    else:
        return JsonResponse({'error': 'Invalid request method'})
    

def parse_actors(actors_string):
    # Split by newline
    lines = actors_string.strip().split("\n")
    
    # Remove the number and dot prefix and strip extra spaces
    parsed_actors = [line.split(". ", 1)[-1].strip() for line in lines]
    
    return parsed_actors



# ############################################################################################################
# Workin' LLMs


def generate_synopsis(topic, df):
    print("generate_synopsis")
    articles = []
    for index, row in df.iterrows():
        articles.append(row['title'])
    articles = ' '.join(articles)

    print(articles)

    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    openai.api_key = OPENAI_API_KEY
    if not OPENAI_API_KEY:
        logger.error("OpenAI API Key not found!")
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages = [{"role": "system", "content": 'You are an AI-driven news analyst programmed to extract and link named entities from textual data. You return only an bullet point list in markdown'},
                    {"role": "user", "content": "Provide a concise summary of the primary events, key stakeholders, and strategic implications related to conflict/topic" + topic + "from the last 24 hours. Instructions: 1. Focus on high-level developments and strategic shifts. 2. Exclude individual anecdotes, isolated incidents, or stories unless they have broader strategic or symbolic significance. 3. Highlight any international involvements or reactions. 4. Prioritize information from reputable news sources and downplay tabloid or less verified news. 5. Offer a balanced perspective, taking into account various viewpoints. 6. No more than 10 sentences and just the plain answer." },
                    {"role": "assistant", "content" : "Ok, show me the articles please" },
                    {"role": "user", "content": "Here are the articles:\n" + articles }],
        stream=False,
                                                                                                        )
    result = response.choices[0]['message']['content']
    print("synopsis generatd")
    print(len(result))
    return result


# OpenAI API - Political Actors
def generate_actors(topic, df):
    print("extracting actors") 
    articles = []
    for index, row in df.iterrows():
        articles.append(row['title'])
    articles = ' '.join(articles)

    from transformers import pipeline

    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    
    # articles = summarizer(articles, max_length=1024, min_length=30, do_sample=False)
    # articles = articles[0]['summary_text']




    openai.api_key = os.getenv("OPENAI_API_KEY")
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages = [{"role": "system", "content": f'You are a political news journalist with expertise in Named Entity Recognition and Entity Linking. Your mission is to sift through news articles and identify the most pertinent political actors associated with a given topic, focusing on the context and relevance. Ensure that the list is selective, concise, and prioritizes the most significant entities. You return only an bullet point list in markdown'},
                    {"role": "user", "content": "The following are articles about" + topic + "from the past 24 hours. Identify the top political actors from these articles, ensuring they hold substantial relevance to the topic. No more than 5 actors and just the plain answer." },
                    {"role": "assistant", "content" : "Ok, show me the articles please" },
                    {"role": "user", "content": "Here are the articles:\n" + articles }],
        stream=False,
                                                                                                        )
    result = response.choices[0]['message']['content']
    # Extracting actor names from markdown list

    print("actors generated")
    print(len(result))
    return result

#Frontend rendering - News Summary
def stream_synopsis(request):
    print("stream_synopsis")
    query = request.GET.get('query', None)  # Get the query from the GET parameters

    if not query:  # Check if the query is provided
        return render(request, 'news/synopsis.html', {})

    df = get_news_data(query)  # Fetch articles related to the query

    synopsis = generate_synopsis(query, df)  # Generate the synopsis using OpenAI


    return render(request, 'news/synopsis.html', {'synopsis': synopsis})

# Frontend rendering - Political Actors
def stream_actors(request):
    print("streaming actors")
    query = request.GET.get('query', None)

    df = get_news_data(query)
    raw_actors_md = generate_actors(query, df)
    
    # Parsing the markdown list to get plain actor names
    parsed_actors = parse_actors(raw_actors_md)

    actors_with_summaries = []

    # Fetch Wikipedia summary for each actor
    for actor in parsed_actors:
        summary = get_wikipedia_summary(actor)
        actor_data = {
            'name': actor,
            'summary': summary
        }
        actors_with_summaries.append(actor_data)

    return render(request, 'news/actors.html', {'actors': actors_with_summaries})

class CustomStreamingCallbackHandler(BaseCallbackHandler):
    def __init__(self, queue):
        super().__init__()
        self.queue = queue

    def on_llm_new_token(self, token: str, **kwargs) -> None:
        self.queue.put(token)

def openai_response_generator(queue, input_text):
    # Initialize the custom callback handler with the queue
    custom_handler = CustomStreamingCallbackHandler(queue)

    # Initialize ChatOpenAI with the custom handler
    llm = ChatOpenAI(
        model_name="gpt-4-1106-preview",
        streaming=True,
        callback_manager=custom_handler
    )


def query(request):
    if request.method == 'POST':
        input_text = request.POST.get('input_text', '')
        queue = Queue()

        # Start the thread for processing
        task = threading.Thread(target=openai_response_generator, args=(queue, input_text))
        task.start()

        # Streaming response setup
        def generate_stream(q):
            while True:  # Implement a condition to break this loop as needed
                stream = q.get()
                yield stream

        return StreamingHttpResponse(generate_stream(queue), content_type="text/event-stream")





# ############################################################################################################
# ############################################################################################################
# ############################################################################################################
# # Fake functions to save API costs while developing


# #Frontend rendering - News Summary
# def stream_synopsis(request):
#     print("stream_synopsis")
#     query = request.GET.get('query', None)  # Get the query from the GET parameters

#     # if not query:  # Check if the query is provided
#     #     return render(request, 'news/synopsis.html', {})

#     # df = get_news_data(query)  # Fetch articles related to the query

#     # synopsis = generate_synopsis(query, df)  # Generate the synopsis using OpenAI


#     return render(request, 'news/synopsis.html', {'synopsis': "While beeing in development, I can not account for the API costs. Thus this is a placeholder and is there to showcase the UI"})

# # Frontend rendering - Political Actors
# def stream_actors(request):
#     print("streaming actors")
#     query = request.GET.get('query', None)

#     # df = get_news_data(query)
#     # raw_actors_md = generate_actors(query, df)
    
#     # # Parsing the markdown list to get plain actor names
#     # parsed_actors = parse_actors(raw_actors_md)

#     # actors_with_summaries = []

#     # # Fetch Wikipedia summary for each actor
#     # for actor in parsed_actors:
#     #     summary = get_wikipedia_summary(actor)
#     #     actor_data = {
#     #         'name': actor,
#     #         'summary': summary
#     #     }
#     #     actors_with_summaries.append(actor_data)

#     return render(request, 'news/actors.html', {'actors': [{"name": "Actor 1", "summary": "This is a summary of actor 1"}, {"name": "Actor 2", "summary": "This is a summary of actor 2"}]})
