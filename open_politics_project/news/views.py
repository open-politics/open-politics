import sys
from pathlib import Path
from news.models import NewsArticle, NewsSource
from django.http import StreamingHttpResponse
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.prompts import BasePromptTemplate
from langchain.schema.runnable import RunnableParallel, RunnablePassthrough
from django.views.decorators.http import require_http_methods

from langchain.callbacks.base import BaseCallbackHandler
from django.views.generic import ListView
from django.http import FileResponse
from django.shortcuts import render
from django.http import JsonResponse
from news.api_calls import call_with_search_parameters
import io
from django.contrib.auth import login

from openai import OpenAI

client = OpenAI(api_key=OPENAI_API_KEY,
api_key=os.getenv("OPENAI_API_KEY"))
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
from .models import Conversation, ChatMessages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views import generic
from django.contrib.sessions.models import Session
import requests
from .serializers import ChatMessageSerializer, ConversationSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from django.http import JsonResponse
from langchain.memory.chat_message_histories.in_memory import ChatMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_together import Together
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login
from langchain_core.runnables import chain
from langchain_core.runnables import RunnableLambda
from langchain_together import Together




llm = Together(
    model="mistralai/Mistral-7B-Instruct-v0.1",
    temperature=0.5,
    max_tokens=256,
    top_k=1,
    together_api_key=str(os.environ.get("TOGETHER_API_KEY"))
)
non_streaming_model_runnable = RunnableLambda(llm)
memory = ConversationBufferMemory()


class SignUpView(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'registration/signup.html'

    def form_valid(self, form):
        # Call the parent class's form_valid method to create the user
        response = super().form_valid(form)

        # Generate a token for the newly registered user
        user = self.object
        token, created = Token.objects.get_or_create(user=user)
        print(token)
        print(token.key)

        if created:
            # Log the user in by creating a session
            login(self.request, user)
            return JsonResponse({'token': token.key}, status=201)
        else:
            # Handle the case where token creation failed
            return JsonResponse({'error': 'Token creation failed'}, status=500)
    
@csrf_exempt
@require_http_methods(["GET", "POST"])
def custom_login_view(request):
    if request.method == 'GET':
        return render(request, 'registration/login.html')  # Path to your login template

    # POST request handling
    username = request.POST.get('username')
    password = request.POST.get('password')
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return JsonResponse({'token': token.key})
    else:
        return JsonResponse({'error': 'Invalid Credentials'}, status=400)

memory = ConversationBufferMemory()

def news_home(request):
    return render(request, "news/news_home.html", {'range_20': range(20)})

def about(request):
    return render(request, "news/about.html" )

def news(request):
    return render(request, "news/news_home.html", {'range_20': range(20)})

def tools(request):
    return render(request, "news/hero_tools.html")

API_URL = "https://api-inference.huggingface.co/models/czearing/article-title-generator"
headers = {"Authorization": str("Bearer" + os.environ.get("HUGGINGFACE_TOKEN"))}

def generate_title(payload):
        response = requests.post(API_URL, headers=headers, json=payload)

        # Check if the response is successful
        if response.status_code == 200:
            data = response.json()
            return data[0]['generated_text']
        else:
            import random
            title = str("Conversation"+str(random.randint(0,10000)))
            data = title
            return data    

def retrieve_conversation(title, user):
    # number of conversations
    num_recent_conversations = 4

    # Retrieve the most recent conversation history from the database
    conversation_obj = Conversation.objects.get(title=title, user=user)
    conversation_id = getattr(conversation_obj, 'id')
    
    # Retrieve recent conversation messages
    conversation_context = ChatMessages.objects.filter(
        conversation_id=conversation_id
    ).order_by('-timestamp')[:num_recent_conversations:-1]
    
    # Storing the retrived data from db to model memory 
    lst = []
    for msg in conversation_context:
        input_msg = getattr(msg, 'user_response')
        output_msg = getattr(msg, 'ai_response')
        lst.append({"input": input_msg, "output": output_msg})
    
    for x in lst:
        inputs = {"input": x["input"]}
        outputs = {"output": x["output"]}
        memory.save_context(inputs, outputs)
    
   
    retrieved_chat_history = ChatMessageHistory(
        messages=memory.chat_memory.messages
    )

    return retrieved_chat_history

# Function to store the conversation to DB
def store_message(user_response, ai_response, conversation_id):
    ChatMessages.objects.create(
        user_response=user_response,
        ai_response=ai_response,
        conversation_id=conversation_id,
    )

# Function to create a Conversation in DB
def store_title(title, user):
    Conversation.objects.create(
        title=title,
        user=user
    )


# creating a new conversation or continuing old conversation, NEEDS WORK!
@csrf_exempt
@api_view(['POST', 'GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def chat(request):
    #get chat history
    if request.method == 'GET':
        request_data = JSONParser().parse(request)
        provided_title = request_data.get('title')
        user = request.user
        if provided_title:
            conversation_title = Conversation.objects.get(
                title=provided_title, user=user)
            conversation_id = getattr(conversation_title, 'id')
            ChatObj = ChatMessages.objects.filter(
                conversation_id=conversation_id).order_by('timestamp')
            Chat = ChatMessageSerializer(ChatObj, many=True)
            return JsonResponse(Chat.data, safe=False)
        else:
            return JsonResponse({'error': 'Title not provided'}, status=400)

    #create new chat or continue old conversation by providing title
    elif request.method == 'POST':
        request_data = JSONParser().parse(request)
        prompt = request_data.get('prompt')
        user = request.user
        provided_title = request_data.get('title')
        if provided_title:
            # Create a ChatMessageHistory instance
            retrieved_chat_history = retrieve_conversation(
                provided_title, user)

        else:
            memory.clear()
            retrieved_chat_history = ChatMessageHistory(messages=[])
            # Generate a default title if not provided
            title = generate_title({
                "inputs": "Blauer Bär"
            })
            store_title(title, user)
        reloaded_chain = ConversationChain(
            llm=llm,
            memory=ConversationBufferMemory(
                chat_memory=retrieved_chat_history),
            verbose=True,
        )
        response = reloaded_chain.predict(input=prompt)

        conversation_title = Conversation.objects.get(title=title, user=user)
        conversation_id = getattr(conversation_title, 'id')
        store_message(prompt, response, conversation_id)

        return JsonResponse({
            'ai_responce': response,
            'title':title
        }, status=201)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])  
def get_title(request):
    user=request.user
    titles= Conversation.objects.filter(user=user)
    serialized= ConversationSerializer(titles, many=True)
    return JsonResponse(serialized.data, safe=False)

# Delete a conversation by providing title of conversation
@csrf_exempt   
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated]) 
def delete_conversation(request):
    user=request.user
    data= JSONParser().parse(request)
    title= data.get('title')
    obj=Conversation.objects.get(user=user, title=title)
    obj.delete()
    return JsonResponse("Deleted succesfully", safe=False)

@csrf_exempt   
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_data(request):
    request_data = JSONParser().parse(request)
    provided_title = request_data.get('title')
    user = request.user
    if provided_title:
        conversation_title = Conversation.objects.get(
            title=provided_title, user=user)
        conversation_id = getattr(conversation_title, 'id')
        ChatObj = ChatMessages.objects.filter(
            conversation_id=conversation_id).order_by('timestamp')
        Chat = ChatMessageSerializer(ChatObj, many=True)
        return JsonResponse(Chat.data, safe=False)
    else:
        return JsonResponse({'error': 'Title not provided'}, status=400)



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
    if not OPENAI_API_KEY:
        logger.error("OpenAI API Key not found!")
    response = client.chat.completions.create(model="gpt-4",
    messages = [{"role": "system", "content": 'You are an AI-driven news analyst programmed to extract and link named entities from textual data. You return only an bullet point list in markdown'},
                {"role": "user", "content": "Provide a concise summary of the primary events, key stakeholders, and strategic implications related to conflict/topic" + topic + "from the last 24 hours. Instructions: 1. Focus on high-level developments and strategic shifts. 2. Exclude individual anecdotes, isolated incidents, or stories unless they have broader strategic or symbolic significance. 3. Highlight any international involvements or reactions. 4. Prioritize information from reputable news sources and downplay tabloid or less verified news. 5. Offer a balanced perspective, taking into account various viewpoints. 6. No more than 10 sentences and just the plain answer." },
                {"role": "assistant", "content" : "Ok, show me the articles please" },
                {"role": "user", "content": "Here are the articles:\n" + articles }],
    stream=False)
    result = response.choices[0].message.content
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




    response = client.chat.completions.create(model="gpt-4",
    messages = [{"role": "system", "content": f'You are a political news journalist with expertise in Named Entity Recognition and Entity Linking. Your mission is to sift through news articles and identify the most pertinent political actors associated with a given topic, focusing on the context and relevance. Ensure that the list is selective, concise, and prioritizes the most significant entities. You return only an bullet point list in markdown'},
                {"role": "user", "content": "The following are articles about" + topic + "from the past 24 hours. Identify the top political actors from these articles, ensuring they hold substantial relevance to the topic. No more than 5 actors and just the plain answer." },
                {"role": "assistant", "content" : "Ok, show me the articles please" },
                {"role": "user", "content": "Here are the articles:\n" + articles }],
    stream=False)
    result = response.choices[0].message.content
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
