import asyncio
import aiohttp
import pandas as pd
from bs4 import BeautifulSoup
from flair.data import Sentence
from flair.models import SequenceTagger
import time
from collections import Counter
import matplotlib.pyplot as plt
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer
from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer
from concurrent.futures import ThreadPoolExecutor


ner_tagger = SequenceTagger.load("flair/ner-english-ontonotes-fast")
client = QdrantClient(
    url="https://34516a79-9bf6-4ea6-a745-e1fcd64d907d.us-east4-0.gcp.cloud.qdrant.io:6333",
    api_key="rFwSrWM73FPqFX98T8Sk9P-hmYF2ZgyFXjNDMeMABfgSphjg4w5hfQ",
    timeout=1200,
)
model = SentenceTransformer('all-MiniLM-L6-v2')


async def get_st_embedding_async(text):
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        return await loop.run_in_executor(pool, lambda: model.encode(text).tolist())

async def scrape_cnn_articles(session):
    start_time = time.time()
    base_url = 'https://www.cnn.com'
    async with session.get(base_url) as response:
        data = await response.text()
        soup = BeautifulSoup(data, features="html.parser")
        all_urls = [base_url + a['href'] for a in soup.find_all('a', href=True) 
                    if a['href'] and a['href'][0] == '/' and a['href'] != '#']

    def url_is_article(url, current_year='2023'):
        return 'cnn.com/{}/'.format(current_year) and '/politics/' in url

    article_urls = [url for url in all_urls if url_is_article(url)]
    tasks = [asyncio.create_task(process_article_url(session, url)) for url in article_urls]
    articles = await asyncio.gather(*tasks)
    end_time = time.time()
    print(f"Scraping CNN articles took: {end_time - start_time} seconds")
    return pd.DataFrame(articles, columns=['url', 'headline', 'paragraphs', 'entities'])

async def process_article_url(session, url):
    start_time = time.time()
    try:
        async with session.get(url) as response:
            article_data = await response.text()
            article_soup = BeautifulSoup(article_data, features="html.parser")
            headline = article_soup.find('h1', class_='headline__text')
            headline_text = headline.text.strip() if headline else 'N/A'
            article_paragraphs = article_soup.find_all('div', class_='article__content')
            cleaned_paragraph = ' '.join([p.text.strip() for p in article_paragraphs])
            entities = await predict_ner_tags_async(cleaned_paragraph)

            print(f"Processed {url}")
            
            return url, headline_text, cleaned_paragraph, entities
    except Exception as e:
        return url, 'N/A', ''
    finally:
        end_time = time.time()
        print(f"Processing {url} took: {end_time - start_time} seconds")

async def predict_ner_tags_async(text):
    def sync_predict_ner_tags(text):
        sentence = Sentence(text)
        ner_tagger.predict(sentence)
        return [(entity.text, entity.tag) for entity in sentence.get_spans('ner')]

    return await asyncio.to_thread(sync_predict_ner_tags, text)

async def process_rows(df, top_n=5):
    entity_counter = Counter()
    
    for _, row in df.head(top_n).iterrows():
        ner_tags = await predict_ner_tags_async(row['paragraphs'])
        if ner_tags:
            for entity, entity_type in ner_tags:
                if entity_type in ['PERSON', 'ORG']:
                    entity_counter[entity] += 1
                    print(f"Entity: {entity}, Type: {entity_type}")

    most_common_entities = entity_counter.most_common()
    return most_common_entities

async def main():
    time_start = time.time()
    async with aiohttp.ClientSession() as session:
        df = await scrape_cnn_articles(session)
        tasks = [get_st_embedding_async(paragraph) for paragraph in df['paragraphs']]
        embeddings = await asyncio.gather(*tasks)
        df['embeddings'] = embeddings
        client.upsert(
            collection_name="news_embeddings",
            points=models.Batch(
                ids=df.index.tolist(),
                vectors=df['embeddings'].tolist(),
                payloads=df[['headline', 'paragraphs', 'entities']].to_dict('records')
            )
        )
        print("Upsert successful")
        query_embedding = model.encode('War in Ukraine')
        search_result = client.search(
            collection_name="news_embeddings",
            query_vector=query_embedding.tolist(),
            limit=3
            
        )
        for scored_point in search_result:
            print(f"Article ID: {scored_point.id}")

            # Check if 'headline' key exists in the payload
            if 'headline' in scored_point.payload:
                print(f"Headline: {scored_point.payload['headline']}")
            
            # Check if 'entities' key exists in the payload
            if 'entities' in scored_point.payload:
                print("Entities:")
                for entity in scored_point.payload['entities']:
                    print(f"  - {entity}")

            # Check if 'paragraphs' key exists in the payload
            if 'paragraphs' in scored_point.payload:
                print("Paragraphs:")
                print(scored_point.payload['paragraphs'])
    
        print("\n" + "="*50 + "\n")  # Separator for readability
        client.close()
    time_end = time.time()
    total_seconds = time_end - time_start
    total_minutes = int(total_seconds / 60)
    total_seconds_remaining = int(total_seconds % 60)
    print(f"Total time: {total_minutes} minutes and {total_seconds_remaining} seconds")
asyncio.run(main())
