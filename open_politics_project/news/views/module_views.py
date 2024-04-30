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

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def tldr_view(request):
    query = request.GET.get('query', '')
    languages = request.GET.getlist('languages', [])
    user = request.user

    # existing_search = SearchHistory.objects.filter(user=user, query=query).first()



    newsapi = NewsApiClient(api_key=os.getenv('NEWS_API_KEY'))

    # Step 1: Search for news articles using NewsAPI
    logging.debug("Step 1: Searching for news articles using NewsAPI")
    articles = newsapi.get_everything(q=query, language=languages[0], page_size=10)['articles'] if languages else newsapi.get_everything(q=query, page_size=10)['articles']

    if not articles:
        return HttpResponse("No relevant articles found for the given query.")

    # Step 2: Extract summaries from the articles
    logging.debug("Step 2: Extracting summaries from the articles")
    summaries = [article['description'] for article in articles if article['description'] and article['description'] != "[Removed]"]
    content = [article['content'] for article in articles if article['content'] and article['content'] != "[Removed]"]
    
    for article in articles:
        article['content'] = article.get('content', '')
        article['image'] = article.get('urlToImage', '')
    
    unique_sources = list(set([article['source']['name'] for article in articles]))
    unique_sources.sort()

    # Step 3: Setup LangChain
    logging.debug("Step 3: Setting up LangChain")
    tldr_prompt_template = ChatPromptTemplate.from_template(
        """You are a political intelligence analyst. Create a TLDR based on the following summaries:\n{summaries}. 
        Include only relevant political information, no anecdotal stories or content or personal opinions. 
        Use Markdown styling with bullet point lists to present this information"""
    )
    output_parser = StrOutputParser()
    model = ChatOpenAI(model="gpt-4-1106-preview", max_tokens=4000)
    chain = ({"summaries": RunnablePassthrough()} | tldr_prompt_template | model | output_parser)

    
    @marvin.model(instructions='Extract issue areas from the text')
    class IssueArea(BaseModel):
        '''Multiple issue areas and their description'''
        name: str
        description: str
    
    @marvin.model(instructions='Generate a 5 emoji string based on the given issue areas')
    class EmojiString(BaseModel):
        emojis: str

    # Step 4: Generate TLDR
    logging.debug("Step 4: Generating TLDR")
    start_time = time.time()
    tldr = chain.invoke("\n".join(summaries))  # This will still return Markdown
    issue_areas = marvin.extract(tldr, target=IssueArea)

    # Step 5
    logging.debug("Step 5: Generating emoji string from issue areas")
    # Assuming marvin.extract returns a collection of objects with an attribute 'emojis' containing emoji strings
    emoji_string = marvin.extract(str(issue_areas), target=EmojiString)
    emoji_string = "".join([emoji.emojis for emoji in emoji_string])  # concatenate all emojis into one string
    emoji_string = emoji_string.replace("ole:", "")  # remove unwanted substrings

    # Use a regex pattern to match all valid emoji characters or sequences
    emoji_pattern = r'\X(?:\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Component})*\X'
    # Find all matches in the text
    emojis = regex.findall(emoji_pattern, emoji_string, regex.UNICODE)
    # Normalize and separate each emoji by filtering out non-emoji characters
    extracted_emojis = [regex.sub(r'[^\p{Emoji}]+', '', e) for e in emojis]
    emoji_string = "".join(extracted_emojis[:7])  # combine the first 7 valid emojis into a single string
    logging.debug(f"Generated emoji string: {emoji_string}")

    end_time = time.time()

    # Convert Markdown to HTML
    tldr_html = markdown.markdown(tldr)
    execution_time = end_time - start_time

    # Filter out articles with "[Removed]" link, content, or summary
    articles = [article for article in articles if article['description'] != "[Removed]" and article['content'] != "[Removed]" and article['urlToImage'] != "[Removed]"]

    if not articles:
        return JsonResponse({'error': 'No relevant articles found for the given query.'}, status=404)
    else:
        # For HTMX requests
        if "HX-Request" in request.headers:
            html = render_to_string('news/tldr_fragment.html', {
                'tldr': tldr_html, 
                'execution_time': execution_time,
                'articles': articles,
                'sources': unique_sources,
                'content': content,
                'issue_areas': issue_areas,
                'emoji_string': emoji_string
            })
            return HttpResponse(html, content_type='text/html')
        else:
            # Also pass the articles data for regular requests
            context = {
                'tldr': tldr_html,
                'execution_time': execution_time,
                'articles': articles,
                'sources': unique_sources,
                'content': content,
                'issue_areas': issue_areas,
                'emoji_string': emoji_string
            }
            return render(request, 'news_home.html', context)

   

@require_http_methods(["GET", "POST"])
def dashboard(request):
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        # Update user profile based on form input
        user_profile.query1 = request.POST.get('query1', '')
        user_profile.query2 = request.POST.get('query2', '')
        user_profile.query3 = request.POST.get('query3', '')
        user_profile.query4 = request.POST.get('query4', '')
        user_profile.save()
        # After update, redirect or handle the HTMX request
        if request.headers.get('HX-Request', '') == 'true':
            return render(request, 'news/dashboard_content.html', {'user_profile': user_profile})
        else:
            return redirect('some-view-name')  # Redirect to a new URL if needed
    else:
        # For GET request just display the page with the form
        return render(request, 'dashboard.html', {'user_profile': user_profile})

def globe(request):
    # Read data from the GeoJSON file
    with open('/Users/jimvincentwagner/pol/open-politics/open_politics_project/news/static/geo_data/articles.geojson') as file:
        geojson_data = json.load(file)

    return render(request, 'news/globe.html', {'geojson_data': json.dumps(geojson_data)})



from prefect import task, Flow
import instructor
from typing import Literal, Iterable
from pydantic import Field, BaseModel
from openai import OpenAI
from django.http import JsonResponse
from marvin import ai_fn

class SubQuery(BaseModel):
    query: str = Field(..., description="Query to search for relevant content")
    category: Literal["situation", "country", "actor", "conflict"] = Field(
        ..., description="Type of analysis or issue area"
    )

#Top issues

@task
def multi_query(request):
    query = request.GET.get('query', '')


    def segment(data: str) -> Iterable[SubQuery]:
        # Apply the patch to the OpenAI client
        # enables response_model keyword
        client = instructor.from_openai(OpenAI())

        return client.chat.completions.create(
            model="gpt-4-turbo",
            response_model=Iterable[SubQuery],
            messages=[
                {
                    "role": "user",
                    "content": f"""Consider the data below: '\n{data}' 
                    and segment it into multiple search queries. 
                    At least 5 from all different perspectives. Concentrate on political, economical questions.""",
                },
            ],
            max_tokens=1000,
        )

    sub_queries = segment(query)
    logger = logging.getLogger(__name__)
    logger.info(f"Segmented query: {query} into sub queries: {sub_queries}")
    # Convert sub_queries to a list of dictionaries
    sub_queries_dict = [sub_query.model_dump() for sub_query in sub_queries]

    # Return the sub_queries as a JSON response
    return JsonResponse({'queries': sub_queries_dict}, safe=False)


class Preset(BaseModel):
    query: str
    language: str
    categories: list[str]
    queries: list[SubQuery]


@task
@ai_fn
def create_preset(
    query: str,
    sub_queries: list[SubQuery],
    language: str = "en",
    categories: list[str] = None,
) -> Preset:
    """
    Create a preset for calling the newsapi based on the provided query and sub-queries.

    1. If `language` is not provided, default to English.
    2. If `categories` is not provided, generate a list of relevant categories based on the `query`.
    3. Return a `Preset` object with the provided and generated values.
    """


@Flow
def execute(request):
    query = request.GET.get('query', '')
    sub_queries_response = multi_query(request)
    sub_queries_dict = json.loads(sub_queries_response.content.decode('utf-8'))['queries']
    sub_queries = [SubQuery(**sq) for sq in sub_queries_dict]

    preset = create_preset(query, sub_queries)

    return JsonResponse(preset.dict(), safe=False)



def user_guide(request):
    return render(request, 'news/user_guide.html')

