# news_scraper/management/commands/ingest_articles.py

from django.core.management.base import BaseCommand
from news.models import Article
from flair.data import Sentence
from flair.models import SequenceTagger
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient, models
import asyncio
from bs4 import BeautifulSoup
import aiohttp

class Command(BaseCommand):
    help = 'Scrape CNN Articles'

    def __init__(self):
        super().__init__()
    
    async def scrape_cnn_articles(self, session):
        base_url = 'https://www.cnn.com'
        async with session.get(base_url) as response:
            data = await response.text()
            soup = BeautifulSoup(data, features="html.parser")
            all_urls = [base_url + a['href'] for a in soup.find_all('a', href=True) 
                        if a['href'] and a['href'][0] == '/' and a['href'] != '#']

        def url_is_article(url, current_year='2023'):
            return 'cnn.com/{}/'.format(current_year) and '/politics/' in url

        article_urls = [url for url in all_urls if url_is_article(url)]
        tasks = [asyncio.create_task(self.process_article_url(session, url)) for url in article_urls]
        articles = await asyncio.gather(*tasks)
        return articles

async def process_article_url(self, session, url):
    try:
        async with session.get(url) as response:
            article_data = await response.text()
            article_soup = BeautifulSoup(article_data, features="html.parser")
            headline = article_soup.find('h1', class_='headline__text')
            headline_text = headline.text.strip() if headline else 'N/A'
            article_paragraphs = article_soup.find_all('div', class_='article__content')
            cleaned_paragraph = ' '.join([p.text.strip() for p in article_paragraphs])
            entities = await self.predict_ner_tags_async(cleaned_paragraph)

            # Create a new Article object and save it to the database
            article = Article(url=url, headline=headline_text, content=cleaned_paragraph, source='CNN')
            article.save()

            return article
    except Exception as e:
        self.stdout.write(self.style.ERROR(f'Error processing article {url}: {e}'))

    def handle(self, *args, **kwargs):
        asyncio.run(self.scrape_and_process_articles())

    async def scrape_and_process_articles(self):
        async with aiohttp.ClientSession() as session:
            articles = await self.scrape_cnn_articles(session)
            for article in articles:
                await self.process_article(article)