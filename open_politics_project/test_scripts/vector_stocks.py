import os
import pandas as pd
import requests
import yfinance as yf
from langchain.document_loaders import TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Qdrant

def get_news_data(query, pageSize=40, sources_choice=None):
    # Setting default source choice to 'all'
    sources_choice = 'all' if sources_choice is None else sources_choice

    sources = None
    if sources_choice == 'trusted':
        sources = 'bbc-news, the-wall-street-journal, the-washington-post, the-new-york-times, the-hill, the-guardian-uk, politico, al-jazeera-english, dw'
    
    api_key = os.environ.get('NEWS_API_KEY')
    if not api_key:
        raise ValueError("NEWS_API_KEY not found in environment variables")

    url = 'https://newsapi.org/v2/top-headlines'
    call_parameters = {
        'q': query,
        'pageSize': pageSize,
        'sources': sources
    }

    response = requests.get(url, params=call_parameters, headers={'Authorization': f'Bearer {api_key}'})

    if response.status_code != 200:
        raise Exception(f"Failed to fetch news data: {response.status_code}, {response.text}")

    json_data = response.json()
    if 'articles' in json_data:
        articles = json_data['articles']
        df = pd.DataFrame(articles, columns=['source', 'author', 'title', 'description', 'url', 'urlToImage', 'publishedAt', 'content'])
    else:
        df = pd.DataFrame()
        print("No articles found in the response.")

    return df

# # Retrieve news data for a specific stock
# try:
#     df = get_news_data("Microsoft")
# except Exception as e:
#     print(f"Error occurred while fetching news: {e}")
#     df = pd.DataFrame()  # Creating an empty DataFrame if fetching fails

# # Check if DataFrame is empty
# if df.empty:
#     print("No news articles to process.")
# else:
#     # Process the news data
#     news_texts = df['title'].fillna('') + ". " + df['content'].fillna('')

#     # Embedding news articles
#     embeddings = OpenAIEmbeddings()
#     news_embeddings = embeddings.embed_documents(news_texts.tolist())

#     # Store embeddings in Qdrant
#     qdrant = Qdrant.from_documents(
#         news_embeddings,
#         location=":memory:",
#         collection_name="stock_news_articles",
#     )

#     # Query with a stock symbol or related term
#     query = "MSFT stock news"
#     found_docs = qdrant.similarity_search(query)

#     # Display the most relevant news articles
#     for doc in found_docs[:5]:  # Display top 5 results
#         print(df.iloc[doc.index]['title'], df.iloc[doc.index]['url'])
