from django.core.management.base import BaseCommand
from news.models import NewsArticle, NewsSource
from news.api_calls import call_with_search_parameters

class Command(BaseCommand):
    help = 'Fetches and stores articles from the NewsAPI and creates sources if they don\'t exist'

    def handle(self, *args, **kwargs):
        # Fetch articles using the search parameters.
        articles_data = call_with_search_parameters()  # Adjust as needed if you'd like to use other parameters
        
        for article_data in articles_data:
            # If the source does not exist, create it
            news_source, _ = NewsSource.objects.get_or_create(
                news_api_source_id=article_data['source']['id'],
                defaults={
                    'name': article_data['source']['name'],
                    # Add other fields here if they are available and relevant
                }
            )

            # Store the article, linking it to its source
            _, created = NewsArticle.objects.get_or_create(
                title=article_data['title'],
                defaults={
                    'source': news_source,
                    'author': article_data['author'],
                    'description': article_data['description'],
                    'url': article_data['url'],
                    'url_to_image': article_data['urlToImage'],
                    'published_at': article_data['publishedAt'],
                    'content': article_data['content']
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully fetched and stored articles'))
