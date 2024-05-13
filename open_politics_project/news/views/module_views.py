import os
import json
import logging
import pandas as pd
import time
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pydantic import BaseModel
import markdown
from django.contrib.auth.decorators import login_required
from newsapi import NewsApiClient
from django.http import HttpResponse
from ..models import UserProfile
from django.shortcuts import render, redirect
import marvin
import regex
from django.test import TestCase, RequestFactory
from ..models import SearchHistory
from django.views.decorators.http import require_http_methods

from prefect import task, Flow
import instructor
from typing import Literal, Iterable, Optional, List
from pydantic import Field, BaseModel
from openai import OpenAI
from django.http import JsonResponse
from marvin import ai_fn
from django.views.decorators.csrf import csrf_exempt

# Configure logging
logging.basicConfig(level=logging.DEBUG)

import os
import json
import time
import logging
import requests
import markdown
from typing import List, Optional
from pydantic import BaseModel, Field
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods
from django.template.loader import render_to_string
from marvin import ai_fn
from prefect import task, Flow
import regex

# Initialize Tavily Search API client
TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')
TAVILY_API_URL = "https://api.tavily.com/search"

class TavilySearchParams(BaseModel):
    api_key: str = TAVILY_API_KEY
    query: str
    search_depth: str = "basic"
    include_images: bool = False
    include_answer: bool = False
    include_raw_content: bool = False
    max_results: int = 10

def search_articles(query: str, languages: List[str]) -> List[dict]:
    params = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "include_images": True,
        "max_results": 10
    }
    response = requests.post(TAVILY_API_URL, json=params)
    response.raise_for_status()
    return response.json().get('results', [])


class SubQuery(BaseModel):
    query: str = Field(..., description="Query to search for relevant content.")
    category: str = Field(..., description="Type of analysis or issue area.")
    domain_level: str = Field(..., description="Analysis scale.")
    region: Optional[str] = Field(None, description="Region like EU or East Asia.")
    red_thread: str = Field(..., description="The intent of the original query.")

@task
def multi_query(request):
    query = request.GET.get('query', '')
    client = instructor.from_openai(OpenAI())
    sub_queries = client.chat.completions.create(
        model="gpt-4-turbo",
        response_model=Iterable[SubQuery],
        messages=[{
            "role": "user",
            "content": f"Segment the query below into multiple search queries: '{query}'."
        }],
        max_tokens=1000,
    )
    sub_queries_dict = [sub_query.model_dump() for sub_query in sub_queries]
    return JsonResponse({'queries': sub_queries_dict}, safe=False)

class Preset(BaseModel):
    query: str
    language: str
    categories: List[str]
    queries: List[SubQuery]

@task
@ai_fn
def create_preset(query: str, sub_queries: List[SubQuery], language: str = "en", categories: List[str] = None) -> Preset:
    return Preset(query=query, language=language, categories=categories or [], queries=sub_queries)

@Flow
def execute(request):
    query = request.GET.get('query', '')
    sub_queries_response = multi_query(request)
    sub_queries_dict = json.loads(sub_queries_response.content.decode('utf-8'))['queries']
    sub_queries = [SubQuery(**sq) for sq in sub_queries_dict]
    preset = create_preset(query, sub_queries)
    return JsonResponse(preset.dict(), safe=False)

def extract_emojis(text: str) -> str:
    emoji_pattern = r'\X(?:\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Component})*\X'
    emojis = regex.findall(emoji_pattern, text, regex.UNICODE)
    extracted_emojis = [regex.sub(r'[^\p{Emoji}]+', '', e) for e in emojis]
    return "".join(extracted_emojis[:7])

def tldr_view(request):
    query = request.GET.get('query', '')
    languages = request.GET.getlist('languages', [])
    user = request.user

    logging.debug("Step 1: Searching for news articles using Tavily API")
    articles = search_articles(query, languages)
    if not articles:
        return HttpResponse("No relevant articles found for the given query.")

    logging.debug("Step 2: Extracting summaries from the articles")
    summaries = [article['content'] for article in articles if 'content' in article and article['content']]
    content = [article['content'] for article in articles if 'content' in article and article['content']]
    unique_sources = sorted(set([article['source']['name'] for article in articles if 'source' in article and 'name' in article['source']]))
    image_urls = articles[0].get('images', [])  # Adjust based on actual structure if needed



    logging.debug("Step 3: Setting up LangChain")
    tldr_prompt_template = ChatPromptTemplate.from_template(
        """You are a political intelligence analyst. Create a TLDR based on the following summaries:\n{summaries}.
        Include only relevant political information, no anecdotal stories or personal opinions.
        Use Markdown styling with bullet point lists to present this information."""
    )
    output_parser = StrOutputParser()
    model = ChatOpenAI(model="gpt-4-1106-preview", max_tokens=4000)
    chain = ({"summaries": RunnablePassthrough()} | tldr_prompt_template | model | output_parser)

    @marvin.model(instructions='Extract issue areas from the text')
    class IssueArea(BaseModel):
        name: str
        description: str

    @marvin.model(instructions='Generate a 5 emoji string based on the given issue areas')
    class EmojiString(BaseModel):
        emojis: str

    logging.debug("Step 4: Generating TLDR")
    start_time = time.time()
    tldr = chain.invoke("\n".join(summaries))
    issue_areas = marvin.extract(tldr, target=IssueArea)

    logging.debug("Step 5: Contextualizing issue areas from a sociopolitical-economic perspective")
    contextualization_prompt_template = ChatPromptTemplate.from_template(
        """You are an expert in sociopolitical and economic analysis. Contextualize the following issue areas from a sociopolitical and economic perspective:\n{issue_areas}.
        Provide detailed insights and relevant connections to current global trends and implications. Give a straightfoward and clean answer. Format the result a bit. Return just the result and nothing else"""
    )
    contextualization_chain = ({"issue_areas": RunnablePassthrough()} | contextualization_prompt_template | model | output_parser)
    contextualized_issue_areas = contextualization_chain.invoke(json.dumps([issue_area.dict() for issue_area in issue_areas]))

    logging.debug("Step 6: Generating emoji string from issue areas")
    emoji_string = marvin.extract(str(issue_areas), target=EmojiString)
    emoji_string = "".join([emoji.emojis for emoji in emoji_string])
    emoji_string = emoji_string.replace("ole:", "")
    emoji_string = extract_emojis(emoji_string)
    logging.debug(f"Generated emoji string: {emoji_string}")

    end_time = time.time()
    tldr_html = markdown.markdown(tldr)
    context_html = markdown.markdown(contextualized_issue_areas)
    execution_time = end_time - start_time

    if not articles:
        return JsonResponse({'error': 'No relevant articles found for the given query.'}, status=404)
    else:
        if "HX-Request" in request.headers:
            html = render_to_string('news/tldr_fragment.html', {
                'tldr': tldr_html,
                'execution_time': execution_time,
                'articles': articles,
                'image_urls': image_urls,
                'sources': unique_sources,
                'content': content,
                'issue_areas': issue_areas,
                'contextualized_issue_areas': context_html,
                'emoji_string': emoji_string
            })
            return HttpResponse(html, content_type='text/html')
        else:
            context = {
                'tldr': tldr_html,
                'execution_time': execution_time,
                'articles': articles,
                'image_urls'
                'sources': unique_sources,
                'content': content,
                'issue_areas': issue_areas,
                'contextualized_issue_areas': context_html,
                'emoji_string': emoji_string
            }
            return render(request, 'news_home.html', context)



   
@csrf_exempt 
@require_http_methods(["GET", "POST"])
def dashboard(request):
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        user_profile.query1 = request.POST.get('query1', '')
        user_profile.query2 = request.POST.get('query2', '')
        user_profile.query3 = request.POST.get('query3', '')
        user_profile.query4 = request.POST.get('query4', '')
        user_profile.save()
        if request.headers.get('HX-Request', '') == 'true':
            return render(request, 'news/dashboard_content.html', {'user_profile': user_profile})
        else:
            return redirect('some-view-name')
    else:
        return render(request, 'dashboard.html', {'user_profile': user_profile})


def globe(request):
    with open('open_politics_project/news/static/geo_data/articles.geojson') as file:
        geojson_data = json.load(file)
    return render(request, 'news/globe.html', {'geojson_data': json.dumps(geojson_data)})


def user_guide(request):
    return render(request, 'news/user_guide.html')


def news_blog(request):
    return render(request, 'news/news_blog.html')

def globe_test(request):
    return render(request, 'news/globe_test.html')


