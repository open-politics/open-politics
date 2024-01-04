import re
import requests
from bs4 import BeautifulSoup
import pandas as pd
from transformers import AutoModel, AutoTokenizer
import torch
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import Distance, VectorParams
from langchain.vectorstores import Qdrant
from langchain.embeddings import HuggingFaceEmbeddings
from sentence_transformers import SentenceTransformer
import aiohttp
import asyncio
from concurrent.futures import ThreadPoolExecutor


# Connect to Qdrant
from qdrant_client import QdrantClient

my_collection = "news_embeddings"

model = SentenceTransformer('all-MiniLM-L6-v2')

async def get_st_embedding_async(text):
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        return await loop.run_in_executor(pool, lambda: model.encode(text).tolist())

client = QdrantClient(
    url="https://34516a79-9bf6-4ea6-a745-e1fcd64d907d.us-east4-0.gcp.cloud.qdrant.io:6333", 
    api_key="rFwSrWM73FPqFX98T8Sk9P-hmYF2ZgyFXjNDMeMABfgSphjg4w5hfQ",
    timeout=1200,
)

# # Scrape CNN Political Resort articles
# def scrape_cnn_articles():
#     all_urls = []
#     url = 'https://www.cnn.com'
#     data = requests.get(url).text
#     soup = BeautifulSoup(data, features="html.parser")
#     for a in soup.find_all('a', href=True):
#         if a['href'] and a['href'][0] == '/' and a['href'] != '#':
#             all_urls.append(url + a['href'])

#     def url_is_article(url, current_year='2023'):
#         return 'cnn.com/{}/'.format(current_year) in url and '/gallery/' not in url

#     article_urls = [url for url in all_urls if url_is_article(url)] # and re.search('polit', url)]

#     df = pd.DataFrame(article_urls, columns=['url'])
#     headline_texts = []
#     paragraphs = []

#     for article_url in article_urls:
#         print(article_url)
#         try:
#             article_data = requests.get(article_url).text
#             article_soup = BeautifulSoup(article_data, features="html.parser")
#             headline = article_soup.find('h1', class_='headline__text')
#             headline_texts.append(headline.text.strip() if headline else 'N/A')
#             article_paragraphs = article_soup.find_all('div', class_='article__content')
#             cleaned_paragraph = ' '.join([p.text.strip() for p in article_paragraphs])
#             paragraphs.append(cleaned_paragraph)
#         except Exception as e:
#             print(f"Error processing {article_url}: {e}")
#             headline_texts.append('N/A')
#             paragraphs.append('')

#     df['headline'] = headline_texts
#     df['paragraphs'] = paragraphs
#     return df

# Async function to scrape articles
async def scrape_cnn_articles(session):
    base_url = 'https://www.cnn.com'
    async with session.get(base_url) as response:
        data = await response.text()
        soup = BeautifulSoup(data, features="html.parser")
        all_urls = [base_url + a['href'] for a in soup.find_all('a', href=True) 
                    if a['href'] and a['href'][0] == '/' and a['href'] != '#']

    def url_is_article(url, current_year='2023'):
        return 'cnn.com/{}/'.format(current_year) in url and '/gallery/' not in url

    article_urls = [url for url in all_urls if url_is_article(url)]
    tasks = [process_article_url(session, url) for url in article_urls]
    articles = await asyncio.gather(*tasks)
    return pd.DataFrame(articles, columns=['url', 'headline', 'paragraphs'])

# Async function to process each article URL
async def process_article_url(session, url):
    try:
        async with session.get(url) as response:
            article_data = await response.text()
            article_soup = BeautifulSoup(article_data, features="html.parser")
            headline = article_soup.find('h1', class_='headline__text')
            headline_text = headline.text.strip() if headline else 'N/A'
            article_paragraphs = article_soup.find_all('div', class_='article__content')
            cleaned_paragraph = ' '.join([p.text.strip() for p in article_paragraphs])

            print(f"Processed {url}")
            
            return url, headline_text, cleaned_paragraph
    except Exception as e:
        return url, 'N/A', ''

# Main async function to run the scraping
async def main():
    async with aiohttp.ClientSession() as session:
        df = await scrape_cnn_articles(session)
        # Generate embeddings asynchronously
        tasks = [get_st_embedding_async(paragraph) for paragraph in df['paragraphs']]
        embeddings = await asyncio.gather(*tasks)
        df['embeddings'] = embeddings
        # [Upsert data into Qdrant and other processing]
        return df

df = asyncio.run(main())
print("Lentgth Articles: " + str(len(df)))

print("Embeddings Head: " + str(df['embeddings'].head()))

# Define the collection name
my_collection = "news_embeddings"

# Recreate the collection
client.recreate_collection(
    collection_name=my_collection,
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE)
)

# Create the payload for upsert
payloads = df[['headline', 'paragraphs']].copy()
payloads['index'] = df.index



# Upsert the data into the collection
try:
    client.upsert(
        collection_name=my_collection,
        points=models.Batch(
            ids=payloads['index'].tolist(),
            vectors=df['embeddings'].tolist(),
            payloads=payloads[['headline', 'paragraphs']].to_dict('records')
        )
    )
    print("Upsert successful")
except Exception as e:
    print(f"Error during upsert: {e}")

# Function to get recommendations based on a query
def get_recommendations(query, top_n=5):
    query_vector = model.encode(query)
    search_result = client.search(
        collection_name=my_collection,
        query_vector=query_vector,
        limit=top_n
    )
    return [hit.payload for hit in search_result]

# Get recommendations for a query
query = input("Enter your query: ")
recommendations = get_recommendations(query)
print('recommendations: ' + str(recommendations))

unique_headlines = set()
for recommendation in recommendations:
    headline = recommendation['headline']
    if headline not in unique_headlines:
        print('Headline: ' + str(headline))
        print('*'*50)
        unique_headlines.add(headline)

# for 'headline in recommendations:
#   print('Headline: ' + headline)
