import os
import json
import logging
import asyncio
import requests
import markdown
import regex

from typing import Literal, Iterable, Optional, List
from pydantic import BaseModel, Field
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django_eventstream import send_event
from django.test import TestCase, RequestFactory

from newsapi import NewsApiClient
from ..models import UserProfile, SearchHistory

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from prefect import task, Flow
import instructor
from openai import OpenAI
import marvin
from marvin import ai_fn


# Configure logging
logging.basicConfig(level=logging.DEBUG)


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
    sub_queries.model_dump = [sub_query.model_dump() for sub_query in sub_queries]
    return JsonResponse({'queries': sub_queries.model_dump}, safe=False)


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
    sub_queries.model_dump = json.loads(sub_queries_response.content.decode('utf-8'))['queries']
    sub_queries = [SubQuery(**sq) for sq in sub_queries.model_dump]
    preset = create_preset(query, sub_queries)
    return JsonResponse(preset.model_dump(), safe=False)


def extract_emojis(text: str) -> str:
    emoji_pattern = r'\X(?:\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Component})*\X'
    emojis = regex.findall(emoji_pattern, text, regex.UNICODE)
    extracted_emojis = [regex.sub(r'[^\p{Emoji}]+', '', e) for e in emojis]
    return "".join(extracted_emojis[:7])


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


trigger_event = asyncio.Event()

async def tldr_sse(request):
    logging.debug("SSE request received")
    query = request.GET.get('query', '')
    languages = request.GET.getlist('languages', [])
    user = request.user

    async def event_stream():
        logging.debug("Event stream started and waiting for trigger event")
        await trigger_event.wait()
        logging.debug("Trigger event received")

        # Step 1: Searching for news articles using Tavily API
        articles = search_articles(query, languages)
        if not articles:
            yield 'event: error\ndata: No relevant articles found for the given query.\n\n'
            return

        yield f'event: articles\ndata: {json.dumps(articles)}\n\n'
        logging.debug(f'Articles sent: {articles}')
        await asyncio.sleep(1)

        # Step 2: Extracting summaries from the articles
        summaries = [article['content'] for article in articles if 'content' in article and article['content']]
        content = [article['content'] for article in articles if 'content' in article and article['content']]
        unique_sources = sorted(set([article['source']['name'] for article in articles if 'source' in article and 'name' in article['source']]))
        image_urls = articles[0].get('images', [])  # Adjust based on actual structure if needed

        # Step 3: Setting up LangChain
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

        # Step 4: Generating TLDR
        tldr = chain.invoke("\n".join(summaries))
        yield f'event: tldr\ndata: {json.dumps({"tldr": tldr})}\n\n'
        logging.debug(f'TLDR sent: {tldr}')
        await asyncio.sleep(1)

        issue_areas = marvin.extract(tldr, target=IssueArea)
        yield f'event: issue_areas\ndata: {json.dumps([issue_area.model_dump() for issue_area in issue_areas])}\n\n'
        logging.debug(f'Issue areas sent: {issue_areas}')
        await asyncio.sleep(1)

        # Step 5: Contextualizing issue areas from a sociopolitical-economic perspective
        contextualization_prompt_template = ChatPromptTemplate.from_template(
            """You are an expert in sociopolitical and economic analysis. Contextualize the following issue areas from a sociopolitical and economic perspective:\n{issue_areas}.
            Provide detailed insights and relevant connections to current global trends and implications. Give a straightforward and clean answer. Format the result a bit. Return just the result and nothing else"""
        )
        contextualization_chain = ({"issue_areas": RunnablePassthrough()} | contextualization_prompt_template | model | output_parser)
        contextualized_issue_areas = contextualization_chain.invoke(json.dumps([issue_area.model_dump() for issue_area in issue_areas]))

        yield f'event: contextualized_issue_areas\ndata: {json.dumps({"context": contextualized_issue_areas})}\n\n'
        logging.debug(f'Contextualized issue areas sent: {contextualized_issue_areas}')
        await asyncio.sleep(1)

        # Step 6: Generating emoji string from issue areas
        emoji_string = marvin.extract(str(issue_areas), target=EmojiString)
        emoji_string = "".join([emoji.emojis for emoji in emoji_string])
        emoji_string = emoji_string.replace("ole:", "")
        emoji_string = extract_emojis(emoji_string)
        yield f'event: emoji_string\ndata: {json.dumps({"emojis": emoji_string})}\n\n'
        logging.debug(f'Emoji string sent: {emoji_string}')

    return StreamingHttpResponse(event_stream(), content_type='text/event-stream')


async def trigger_handler(request):
    global trigger_event
    logging.debug("Trigger handler called")
    trigger_event.set()
    logging.debug("Trigger event set")
    return HttpResponse('Triggered!')


def tldr_view(request):
    query = request.GET.get('query', '')
    languages = request.GET.getlist('languages', [])
    user = request.user

    return render(request, 'news_home.html', {'query': query})


from django.http import JsonResponse

def react_index(request):
    return render(request, 'news/react_index.html')

def geojson_view(request):
    data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [102.0, 0.5]
                },
                "properties": {
                    "prop0": "value0"
                }
            }
        ]
    }
    return JsonResponse(data)



def country_from_query(request):
    query = request.GET.get('query', '')
    print(query)
    country_name = marvin.cast(query, target=str, instructions="Return the country name most relevant to the query.")
    country_code = marvin.cast(query, target=str, instructions="Return the ISO2 code most relevant to the query.")
    print(country_name, country_code)
    return JsonResponse({"country_name": country_name, "country_code": country_code})


from bs4 import BeautifulSoup

@csrf_exempt
def get_leaders(request):
    url = "https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government"
    response = requests.get(url)
    html_content = response.text

    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', {'class': 'wikitable sortable plainrowheaders sticky-header'})

    leaders = []

    def get_wikipedia_image_url(page_title):
        api_url = f"https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "titles": page_title,
            "prop": "pageimages",
            "pithumbsize": 500
        }
        response = requests.get(api_url, params=params).json()
        pages = response['query']['pages']
        for page_id, page_data in pages.items():
            if 'thumbnail' in page_data:
                return page_data['thumbnail']['source']
        return None

    for row in table.find_all('tr'):
        cells = row.find_all(['th', 'td'])
        if len(cells) >= 3:
            state = cells[0].get_text(strip=True)
            head_of_state = cells[1].get_text(strip=True)
            head_of_government = cells[2].get_text(strip=True)

            head_of_state_name = head_of_state.split('–')[-1].strip()
            head_of_government_name = head_of_government.split('–')[-1].strip()

            head_of_state_image = get_wikipedia_image_url(head_of_state_name)
            head_of_government_image = get_wikipedia_image_url(head_of_government_name)

            leaders.append({
                'State': state,
                'Head of State': head_of_state_name,
                'Head of State Image': head_of_state_image,
                'Head of Government': head_of_government_name,
                'Head of Government Image': head_of_government_image
            })

    return JsonResponse({'leaders': leaders})

@csrf_exempt
def get_leaders(request):
    with open('leaders.json', 'r') as f:
        leaders = json.load(f)
    return JsonResponse({'leaders': leaders})

@csrf_exempt
def get_leader_info(request, state):
    with open('open_politics_project/news/static/geo_data/leaders.json', 'r') as f:
        leaders = json.load(f)
    for leader in leaders:
        if leader['State'] == state:
            return JsonResponse(leader)
    return JsonResponse({'error': 'State not found'}, status=404)