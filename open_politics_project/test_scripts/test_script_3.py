import langchain
import os
import openai
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.schema.output_parser import StrOutputParser
import pandas as pd
import json
import requests
from test_decorator import log_results

openai.api_key = os.environ.get('OPENAI_API_KEY')


def call_with_search_parameters(options):
    api_key = os.environ.get('NEWS_API_KEY')
    url = 'https://newsapi.org/v2/top-headlines'

    call_parameters = {
        #'country': options.get('country'),
        'category': options.get('category'),
        'sources': options.get('sources'),
        'q': options.get('q'),
        'pageSize': options.get('pageSize', 10),
        'page': options.get('page', 1)
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
            articles_text = df['content'][:20]
            return df, articles_text
        else:
            print("Unexpected API response:", json_data)
            return pd.DataFrame()
    else:
        print("Unexpected API response:", response.status_code, response.text)
        return pd.DataFrame()

subject = "Russia War"
query_generator_template = f"""
	You are a Information gathering Intelligence Agent.
	You are tasked with gathering information about a subject.
    The query is {subject}.
    
    1. categorize this query into a category of the following: person, conflict, thematic complex.
    2. Return a keyword query to check for in wikipedia.
    3. Return a keyword query to check for in news.
    
	Return the results as a json object with the keys: category, wikipedia, news.
        
	"""


query_generator = ChatPromptTemplate(query_generator_template)

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_template(query_generator)
chain = prompt | model | StrOutputParser()


query = chain.invoke({'subject': 'Russia War'})
print(query)
query_dict = json.loads(query)

if "category" in query_dict:
    print("Category:", query_dict['category'])
    
news = call_with_search_parameters({'q': query_dict['category'], 'pageSize': 10, 'sources': None})

print(news)





