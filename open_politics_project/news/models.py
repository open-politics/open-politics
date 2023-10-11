from django.db import models

class NewsSource(models.Model):
    # Standard ID field
    id = models.AutoField(primary_key=True)
    news_api_source_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    category = models.CharField(max_length=255, null=True, blank=True)
    language = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    

class NewsArticle(models.Model):
    source = models.ForeignKey(NewsSource, on_delete=models.CASCADE)
    author = models.CharField(max_length=255, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    url = models.URLField()
    url_to_image = models.URLField(null=True, blank=True)
    published_at = models.DateTimeField() # This assumes that the datetime is in ISO format and can be parsed directly by Django
    content = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title
