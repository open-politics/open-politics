import os
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

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# def tldr_view(request):
#     csv_file_path = os.path.join(settings.BASE_DIR, 'news', 'articles.csv')

#     # Step 1: Read the dataset
#     logging.debug("Step 1: Reading the dataset")
#     file = pd.read_csv(csv_file_path)

#     # Step 2: Drop rows with NaN values
#     logging.debug("Step 2: Dropping rows with NaN values")
#     file = file.dropna(subset=['paragraphs', 'summary'])

#     # Step 3: Filter relevant summaries
#     logging.debug("Step 3: Filtering relevant summaries")
#     articles = file[(file['relevance'] == 'relevant') & (file['summary'].notna())].head(8)
#     relevant_summaries = articles['summary'].tolist()

#     if not relevant_summaries:
#         return HttpResponse("No relevant summaries available for TLDR synthesis.")

#     # Step 4: Setup LangChain
#     logging.debug("Step 4: Setting up LangChain")
#     tldr_prompt_template = ChatPromptTemplate.from_template(
#         """You are a political intelligence analyst. Create a TLDR based on the following summaries:\n{summaries}. 
#         Inlude only relevant political information, no anecdotal stories or content or personal opinions. 
#         Use Markdown styling with bullet point lists to present this information"""
#     )
#     output_parser = StrOutputParser()
#     model = ChatOpenAI(model="gpt-4-1106-preview", max_tokens=4000)
#     chain = ({"summaries": RunnablePassthrough()} | tldr_prompt_template | model | output_parser)

#     # Step 5: Generate TLDR
#     logging.debug("Step 5: Generating TLDR")
#     start_time = time.time()
#     tldr_markdown = chain.invoke("\n".join(relevant_summaries))  # This will still return Markdown
#     end_time = time.time()

#     # Convert Markdown to HTML
#     tldr_html = markdown.markdown(tldr_markdown)

#     execution_time = end_time - start_time

#      # For HTMX requests
#     if "HX-Request" in request.headers:
#         html = render_to_string('news/tldr_fragment.html', {
#             'tldr': tldr_html, 
#             'execution_time': execution_time,
#             'articles': articles.to_dict(orient='records')  # Pass the articles data
#         })
#         return HttpResponse(html, content_type='text/html')
#     else:
#         # Also pass the articles data for regular requests
#         context = {
#             'tldr': tldr_html,
#             'execution_time': execution_time,
#             'articles': articles[['summary', 'url']].to_dict(orient='records')  # Pass the articles data
#         }
#         return render(request, 'news_home.html', context)
    

# # mock function
# def tldr_view(request):
#     html= """
        
#     <style>

#         h2 {
#             color: #333;
#         }
        
#         .button {
#             background-color: #007bff;
#             color: white;
#             padding: 10px 20px;
#             border: none;
#             border-radius: 5px;
#             cursor: pointer;
#             font-size: 16px;
#         }
        
#         .button:hover {
#             background-color: #0056b3;
#         }
        
#         .article-card {
#             background-color: white;
#             margin: 20px 0;
#             padding: 20px;
#             border-radius: 8px;
#             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
#         }
        
#         .article-card h2 {
#             margin-top: 0;
#             color: #007bff;
#         }
        
#         .article-card p {
#             font-size: 16px;
#         }
        
#         #tldr-container {
#             margin-top: 20px;
#         }
        
#         a {
#             text-decoration: none;
#             color: #007bff;
#         }
        
#         a:hover {
#             text-decoration: underline;
#         }
#     </style>    

#     <h1>TLDR Summary Generator</h1>

#     <button class="button" hx-get="/fetch-tldr/" hx-target="#tldr-container" hx-trigger="click">
#         Fetch TLDR
#     </button>

#     <div id="articles-output">
        
#     </div>

#     <div id="tldr-container" class=""><style>
#         .grid-container {
#             display: grid;
#             grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
#             grid-gap: 20px;
#         }

#         .article-card {
#             background-color: #f9f9f9;
#             padding: 20px;
#             border-radius: 5px;
#             box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
#             transition: transform 0.3s ease-in-out;
#         }

#         .article-card img {
#             width: 100%;
#             height: auto;
#         }
#         .article-card .title a {
#             color: #333; /* Change the color of the link */
#             text-decoration: none; /* Remove the underline */
#         }

#         .article-card .title a:hover {
#             color: #007BFF; /* Change the color of the link when hovered */
#         }

#         .article-card .title h2 {
#             margin: 0; /* Remove the margin */
#         }

#         /* Existing CSS code */
#     </style>

#     <!-- Existing HTML code -->
#     <div id="tldr-output" style="font-family: 'Arial', sans-serif; font-size: 18px; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
#         <h3>TL;DR Political Summary:</h3>
#     <ol>
#     <li><strong>Jamie Webster</strong>:</li>
#     <li>Liverpool singer, known for his political and football-inspired music.</li>
#     <li>Touches on themes like poverty, mental health, and politics with an anti-establishment tone.</li>
#     <li>
#     <p>Plans to headline a major show, continues to gain a following despite controversy.</p>
#     </li>
#     <li>
#     <p><strong>Allie Phillips</strong>:</p>
#     </li>
#     <li>Running for Tennessee House, campaign focused on reproductive rights.</li>
#     <li>Reflects Democrats' attempt to flip certain districts, addressing gun safety and education.</li>
#     <li>
#     <p>Represents a challenge to the Republican strategy of avoiding abortion discussions.</p>
#     </li>
#     <li>
#     <p><strong>US Political Dynamics</strong>:</p>
#     </li>
#     <li><strong>Republican Party's stance on Ukraine aid</strong>: Some members use aid as a political lever, causing concern for Ukraine's security assistance.</li>
#     <li><strong>Bipartisan immigration deal</strong>: Negotiations in Congress are threatened by opposition from former President Trump and hard-right Republicans, with potential implications for Ukraine aid support.</li>
#     </ol>
#     <hr>
#     <p><strong>Political Actors:</strong></p>
#     <ol>
#     <li><strong>Allie Phillips</strong>:</li>
#     <li>
#     <p>Candidate for Tennessee House, emphasizing reproductive rights and education reform.</p>
#     </li>
#     <li>
#     <p><strong>Volodymyr Zelenskyy</strong>:</p>
#     </li>
#     <li>
#     <p>President of Ukraine, concerned about the politicization of US aid by certain Republican lawmakers.</p>
#     </li>
#     <li>
#     <p><strong>Mike Johnson</strong> (House Speaker):</p>
#     </li>
#     <li>Navigating pressures between former President Trump's camp and the push for a bipartisan immigration deal.</li>
#     </ol>
#     </div>

#     <!-- Existing HTML code -->
#     <div id="articles-output" class="grid-container">
        
#         <div class="article-card">
#             <div class="title">
#                 <a href="https://www.bbc.co.uk/news/entertainment-arts-68126892">
#                     <h2>https://www.bbc.co.uk/news/entertainment-arts-68126892</h2> <!-- Ensure this matches what you pass from the view -->
#                 </a>
#             </div>
#             <div class="content">
#                 <p>Liverpool singer Jamie Webster has gained fame in his home city and beyond with his politically charged and football-inspired music. His anthemic songs have resonated with audiences, leading to sold-o</p>
#             </div>
#             <div class="toggle-button" onclick="toggleContent(this)">Read more</div>
#             <img src="https://source.unsplash.com/random" alt="Unsplash Image">
#         </div>

#         <div class="article-card">
#             <div class="title">
#                 <a href="https://www.npr.org/2024/02/05/1228326177/abortion-allie-phillips-tennessee-reproductive-rights-pregnancy">
#                     <h2>https://www.npr.org/2024/02/05/1228326177/abortion-allie-phillips-tennessee-reproductive-rights-pregnancy</h2> <!-- Ensure this matches what you pass from the view -->
#                 </a>
#             </div>
#             <div class="content">
#                 <p>Allie Phillips, a 28-year-old mother who runs a daycare in Tennessee, was inspired to enter politics after facing a devastating pregnancy loss and navigating restrictive abortion laws. She is now runn</p>
#             </div>
#             <div class="toggle-button" onclick="toggleContent(this)">Read more</div>
#             <img src="https://source.unsplash.com/random" alt="Unsplash Image">
#         </div>

#         <div class="article-card">
#             <div class="title">
#                 <a href="https://gizmodo.com/elon-musk-drug-rumors-ces-2024-apple-sec-hack-google-tv-1851163015">
#                     <h2>https://gizmodo.com/elon-musk-drug-rumors-ces-2024-apple-sec-hack-google-tv-1851163015</h2> <!-- Ensure this matches what you pass from the view -->
#                 </a>
#             </div>
#             <div class="content">
#                 <p>The article covers various topics including Elon Musk's alleged drug use, controversial tweets he endorsed, Apple's 'batterygate' settlement payments, highlights from CES 2024, new features revealed f</p>
#             </div>
#             <div class="toggle-button" onclick="toggleContent(this)">Read more</div>
#             <img src="https://source.unsplash.com/random" alt="Unsplash Image">
#         </div>

#         <div class="article-card">
#             <div class="title">
#                 <a href="https://www.businessinsider.com/zelenskyy-radical-republican-rhetoric-terrifies-ukrainians-2024-1">
#                     <h2>https://www.businessinsider.com/zelenskyy-radical-republican-rhetoric-terrifies-ukrainians-2024-1</h2> <!-- Ensure this matches what you pass from the view -->
#                 </a>
#             </div>
#             <div class="content">
#                 <p>The article discusses how the Republican Party in the US has politicized aid to Ukraine, causing fear and concern for Ukrainian President Volodymyr Zelenskyy. Zelenskyy expressed that radical voices w</p>
#             </div>
#             <div class="toggle-button" onclick="toggleContent(this)">Read more</div>
#             <img src="https://source.unsplash.com/random" alt="Unsplash Image">
#         </div>

#         <div class="article-card">
#             <div class="title">
#                 <a href="https://www.npr.org/2024/01/20/1225788314/election-year-politics-threaten-senate-border-deal">
#                     <h2>https://www.npr.org/2024/01/20/1225788314/election-year-politics-threaten-senate-border-deal</h2> <!-- Ensure this matches what you pass from the view -->
#                 </a>
#             </div>
#             <div class="content">
#                 <p>Negotiators in Congress are working on a bipartisan deal on border and immigration. Former President Donald Trump and hard-right Republicans are opposing the compromise, putting the agreement at risk.</p>
#             </div>
#             <div class="toggle-button" onclick="toggleContent(this)">Read more</div>
#             <img src="https://source.unsplash.com/random" alt="Unsplash Image">
#         </div>

#     </div>

#     <!-- Existing JavaScript code -->
#     <script>
#         function toggleContent(button) {
#             var card = button.parentNode;
#             card.classList.toggle("expanded");
#             if (card.classList.contains("expanded")) {
#                 button.innerHTML = "Minimize";
#             } else {
#                 button.innerHTML = "Read more";
#             }
#         }
#     </script>
#     </div>

#     <script src="https://unpkg.com/htmx.org"></script>




#         <script>
#         document.addEventListener('DOMContentLoaded', function() {
#             const cookieBanner = document.getElementById('cookie-banner');
        
#             // Check if cookie already set
#             if (!localStorage.getItem('cookieBannerDisplayed')) {
#                 cookieBanner.style.display = 'block'; // Show the banner
#             }
        
#             // Event listener for the 'Got it!' button
#             document.getElementById('cookie-btn').addEventListener('click', function() {
#                 cookieBanner.style.display = 'none'; // Hide the banner
#                 localStorage.setItem('cookieBannerDisplayed', 'true'); // Set a flag in localStorage
#             });
#         });
        
#         </script>    

#         <script>
#         // Assuming you have the token stored in a variable 'token'
#         const socket = new WebSocket(`ws://127.0.0.1:8000/chat/get-data/?token=${token}`);

#         socket.onmessage = function(e) {
#             const data = JSON.parse(e.data);
#             console.log(data);
#         }

#         socket.onclose = function(e) {
#             console.error('Chat socket closed unexpectedly');
#         }

#         document.querySelector('#chat-message-submit').onclick = function(e) {
#             const messageInputDom = document.querySelector('#chat-message-input');
#             const message = messageInputDom.value;
#             socket.send(JSON.stringify({
#             'message': message
#             }));
#             messageInputDom.value = '';
#         };

#     </script>


#     """
#     return HttpResponse(html)
    
# # a mock function that pulls from the dataframe and has a placeholder tldr
# def tldr_view(request):
#     # Step 1: Read the dataset
#     csv_file_path = os.path.join(settings.BASE_DIR, 'news', 'articles.csv')

#     file = pd.read_csv(csv_file_path)

#     # Step 2: Drop rows with NaN values in 'paragraphs' and 'summary' to ensure clean data
#     file = file.dropna(subset=['paragraphs', 'summary'])

#     # Step 3: Filter for summaries of relevant articles and store them in a variable
#     relevant_summaries = file[(file['relevance'] == 'relevant') & (file['summary'].notna())]['summary'].tolist()

#     tldr = """
#     TL;DR Political Summary:
#     1. **Jamie Webster**:
#        - Liverpool singer, known for his political and football-inspired music.
#        - Touches on themes like poverty, mental health, and politics with an anti-establishment tone.
#        - Plans to headline a major show, continues to gain a following despite controversy.
#     """

#     articles = file[(file['relevance'] == 'relevant') & (file['summary'].notna())].head(5)

#     tldr_html = markdown.markdown(tldr)
#     execution_time = 0.0

#     if "HX-Request" in request.headers:
#         html = render_to_string('news/tldr_fragment.html', {
#             'tldr': tldr_html, 
#             'execution_time': execution_time,
#             'articles': articles.to_dict(orient='records')  # Pass the articles data
#         })
#         return HttpResponse(html, content_type='text/html')
#     else:
#         # Also pass the articles data for regular requests
#         context = {
#             'tldr': tldr_html,
#             'execution_time': execution_time,
#             'articles': articles[['summary', 'url']].to_dict(orient='records')  # Pass the articles data
#         }
#         return render(request, 'news_home.html', context)

def tldr_view(request):
    query = request.GET.get('query', '')
    languages = request.GET.getlist('languages', [])

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
    emoji_string = marvin.extract(str(issue_areas), target=EmojiString)
    
    end_time = time.time()

    # Convert Markdown to HTML
    tldr_html = markdown.markdown(tldr)
    execution_time = end_time - start_time

    # Filter out articles with "[Removed]" link, content, or summary
    articles = [article for article in articles if article['description'] != "[Removed]" and article['content'] != "[Removed]" and article['urlToImage'] != "[Removed]"]

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


def generate_tldr_with_langchain(article_summaries):
    """
    Simulate TLDR generation with LangChain or your summarization tool.
    Replace this with actual calls to LangChain and processing.
    """
    # Simulated TLDR generation logic. Replace with actual implementation.
    combined_summaries = " ".join(article_summaries)
    tldr = f"TLDR: {combined_summaries[:150]}..."  # Simplified example
    return tldr
    
def dashboard(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        user_profile.query1 = request.POST.get('query1', '')
        user_profile.query2 = request.POST.get('query2', '')
        user_profile.query3 = request.POST.get('query3', '')
        user_profile.query4 = request.POST.get('query4', '')
        user_profile.save()

    context = {'user_profile': user_profile}

    if "HX-Request" in request.headers:
        return render(request, 'news/dashboard_content.html', context)
    else:
        return render(request, 'dashboard.html', context)

def fetch_tldr_with_issue_areas(request):
    query = request.GET.get('query', '')

    if query:
        newsapi = NewsApiClient(api_key=os.getenv('NEWS_API_KEY'))
        try:
            articles = newsapi.get_everything(q=query, page_size=10)['articles']
            article_summaries = [article['description'] for article in articles if article['description']]
            
            # Setup LangChain
            tldr_prompt_template = ChatPromptTemplate.from_template(
                """You are a political intelligence analyst. Create a TLDR based on the following summaries:\n{summaries}. 
                Include only relevant political information, no anecdotal stories or content or personal opinions. 
                Use Markdown styling with bullet point lists to present this information"""
            )
            output_parser = StrOutputParser()
            if os.env("IN_DOCKER") == True:
                model = ChatOpenAI(model="gpt-4-1106-preview", max_tokens=4000)
            else:
                model = ChatOpenAI(model="gpt-3.5-turbo", max_tokens=4000)
            chain = ({"summaries": RunnablePassthrough()} | tldr_prompt_template | model | output_parser)

            @marvin.model(instructions='Extract issue areas from the text')
            class IssueArea(BaseModel):
                '''Multiple issue areas and their description'''
                name: str
                description: str
            
            # Generate TLDR
            tldr_markdown = chain.invoke("\n".join(article_summaries))
            tldr_html = markdown.markdown(tldr_markdown)
            issue_areas = marvin.extract(tldr_markdown, target=IssueArea)
            print(f"Issue areas extracted: {issue_areas}")
             
            context = {
                'tldr': tldr_html,
                'articles': articles[['summary', 'url']].to_dict(orient='records'),
                'issue_areas': issue_areas  # Pass the issue_areas to the template context
            }
            return render(request, 'tldr_fragment.html', context)

        except Exception as e:
            logging.error(f"Error fetching or processing articles for query {query}: {str(e)}")
            context = {
                'tldr': "An error occurred while fetching or processing articles.",
                'articles': [],
            }
    else:
        context = {
            'tldr': "No query provided.",
            'articles': [],
        }

    return render(request, 'tldr_fragment.html', context)
