# news_scraper/management/commands/ingest_articles.py

from django.core.management.base import BaseCommand
from news.models import Article
from flair.data import Sentence
from flair.models import SequenceTagger
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient, models
import asyncio
from asgiref.sync import sync_to_async

class Command(BaseCommand):
    help = 'Ingest scraped articles into Qdrant'

    def __init__(self):
        super().__init__()
        self.ner_tagger = SequenceTagger.load("flair/ner-english-ontonotes-fast")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = QdrantClient(
            url="https://34516a79-9bf6-4ea6-a745-e1fcd64d907d.us-east4-0.gcp.cloud.qdrant.io:6333",
            api_key="rFwSrWM73FPqFX98T8Sk9P-hmYF2ZgyFXjNDMeMABfgSphjg4w5hfQ",
            timeout=1200,
        )

    async def get_st_embedding_async(self, text):
        return self.model.encode(text).tolist()

    async def predict_ner_tags_async(self, text):
        sentence = Sentence(text)
        self.ner_tagger.predict(sentence)
        return [(entity.text, entity.tag) for entity in sentence.get_spans('ner')]

    async def process_article(self, article):
        try:
            entities = await self.predict_ner_tags_async(article.content)
            embedding = await self.get_st_embedding_async(article.content)

            # Store in Qdrant
            self.client.upsert(
                collection_name="news_embeddings",
                points=models.Batch(
                    ids=[str(article.id)],
                    vectors=[embedding],
                    payloads=[{'headline': article.headline, 'content': article.content, 'entities': entities}]
                )
            )
            result_message = f'Processed and stored in Qdrant: {article.url}'
            self.stdout.write(self.style.SUCCESS(result_message))
        except Exception as e:
            error_message = f'Error processing article {article.url}: {e}'
            self.stdout.write(self.style.ERROR(error_message))

    async def process_articles(self):
        # Fetch articles in a synchronous context
        articles = await sync_to_async(list)(Article.objects.all())
        for article in articles:
            await self.process_article(article)

    async def handle(self, *args, **kwargs):
        articles = Article.objects.all()
        tasks = [self.process_article(article) for article in articles]
        await asyncio.gather(*tasks)