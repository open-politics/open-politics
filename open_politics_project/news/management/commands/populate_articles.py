from django.core.management.base import BaseCommand
from news.models import NewsArticle, NewsSource
from news.api_calls import call_with_search_parameters

class Command(BaseCommand):
    help = 'Fetches and stores articles from the NewsAPI and creates sources if they don\'t exist'

    def add_arguments(self, parser):
        # Adding arguments to match the query possibilities of the API
        parser.add_argument('--country', type=str, help='2-letter ISO 3166-1 code of the country.')
        parser.add_argument('--category', type=str, help='Category to get headlines for.')
        parser.add_argument('--sources', type=str, help='Comma-separated identifiers for news sources or blogs.')
        parser.add_argument('--q', type=str, help='Keywords or a phrase to search for.')
        parser.add_argument('--pageSize', type=int, default=20, help='Number of results to return per page. Default is 20, max is 100.')
        parser.add_argument('--page', type=int, default=1, help='Page through the results.')

    def handle(self, *args, **options):
        # Fetch articles using the search parameters.
        try:
            self.stdout.write("Fetching articles from API...")
            articles_data = call_with_search_parameters(options)

            if not articles_data:
                self.stdout.write(self.style.WARNING('No articles found with the provided parameters.'))
                return  # Exit the function

            self.stdout.write(f"Found {len(articles_data)} articles.")

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
                NewsArticle.objects.get_or_create(
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

                self.stdout.write(f"Article '{article_data['title']}' stored or already exists.")

            self.stdout.write(self.style.SUCCESS('Successfully fetched and stored articles'))
        except ValueError as e:
            self.stdout.write(self.style.ERROR(str(e)))
        
        # Store the article, linking it to its source
        NewsArticle.objects.get_or_create(
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
