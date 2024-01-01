# Imports
from transformers import pipeline
import requests
import networkx as nx
import matplotlib.pyplot as plt
import os
import pandas as pd
import openai
import sys
from transformers import pipeline

# Query
language = 'us'
query = 'Israel'
topic = query
pageSize = 40
sources_choice = None

if sources_choice == 'all' or sources_choice is None:
    sources = None
elif sources_choice == 'trusted':
    sources = 'bbc-news, the-wall-street-journal, the-washington-post, the-new-york-times, the-hill, the-guardian-uk, politico, al-jazeera-english', 'dw'
    


# Load the BART - Summarization pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Query News API
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
            return df
        else:
            print("Unexpected API response:", json_data)
            return pd.DataFrame()
    else:
        print("Unexpected API response:", response.status_code, response.text)
        return pd.DataFrame()
    

def add_sums_to_df(df):
    df['summary'] = None
    for idx, row in df.iterrows():
        article_text = row['content']
        if article_text:  # this will check if article_text is not None or not NaN
            summary = summarizer(article_text, min_length=5, max_length=100)
            df.at[idx, 'summary'] = summary
    return df

def main():
    df = call_with_search_parameters({'q': query, 'pageSize': pageSize, 'sources': sources})
    # df = add_sums_to_df(df)
    print(df['url'][:5])

if __name__ == '__main__':
    main()































## Old scripts

# def get_entities(df):
#     HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
#     API_URL = "https://api-inference.huggingface.co/models/mdarhri00/named-entity-recognition"
#     headers = {"Authorization": "Bearer " + HUGGINGFACE_TOKEN}
    
#     def query(payload):
#         response = requests.post(API_URL, headers=headers, json=payload)
#         return response.json()
    
#     df['entities'] = None

#     for idx, row in df.iterrows():
#         article_text = row['content']

#         if article_text:  # this will check if article_text is not None or not NaN
#             output = query({"inputs": article_text})
#             df.at[idx, 'entities'] = output
#     return df

# def synopsis(topic, df):
#     template = f""""
#     These following are the most important news articles about {topic} from the last 24 hours.
#     Please provide a balanced synopsis of the topic and the related news
#     """
#     # concentate articles into one string
    
#     articles = []
#     for index, row in df.iterrows():
#         articles.append(row['title'])
#     articles = ' '.join(articles)


#     openai.api_key = os.getenv("OPENAI_API_KEY")
#     response = openai.ChatCompletion.create(
#         model="gpt-4",
#         messages = [{"role": "system", "content": 'You are a political news journalist tasked with Named Entity Recognition and Entity linking tasks.'},
#                     {"role": "user", "content": "These following are the articles about" + topic + "from the last 24 hours. Please give a short summary about what is important right now to know about this matter. No more than 5 sentences and just the plain answer." },
#                     {"role": "assistant", "content" : "Ok, show me the articles please" },
#                     {"role": "user", "content": "Here are the articles:\n" + articles }],
#         stream=True,
#                                                                                                         )
#     for chunk in response:
#         if 'choices' in chunk and \
#         'delta' in chunk.get('choices')[0] and \
#         'content' in chunk.get('choices')[0]['delta']:
#             item = chunk.get('choices')[0]['delta']['content']
#             sys.stdout.write(item)
#             sys.stdout.flush()

# def most_important_news_for_entity(query, df, articles):
#     template = """"
#     These following are the most important news articles about {entity} from the last 24 hours.
#     Write a 3 sentence summary for what is important to know right now.
#     Also write down their historic relation to other entities.
#     Here are the articles: {articles}.
#     And here are the other entities: {entities}.
#     """
#     query = query
#     articles = []

#     for index, row in df.iterrows():
#         articles.append(row['title'])
#     articles = ' '.join(articles)


#     openai.api_key = os.getenv("OPENAI_API_KEY")
#     llm = openai.ChatCompletion.create(
#         model="gpt-4",
#         messages = [{"role": "system", "content": 'You are a political news journalist tasked with Named Entity Recognition and Entity linking tasks.'},
#                     {"role": "user", "content": "These following are the articles about" + query + "from the last 24 hours. Please give a short summary about what is important right now to know about this matter. No more than 3 sentences and just the plain answer." },
#                     {"role": "assistant", "content":  "Ok, show me the articles please" },
#                     {"role": "user", "content": "Here are the articles:" + articles }]
#                                                                                         )

# def main():
#     df = call_with_search_parameters({'q': query, 'pageSize': pageSize, 'sources': sources})
#     print(df)
#     synopsis(topic, df)
