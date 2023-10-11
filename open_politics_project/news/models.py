
from django.db import models

class NewsSource(models.Model):
    id = models.CharField(max_length=255, null=True, blank=True) # Set to CharField since the 'id' can be a string like 'business-insider' or null
    name = models.CharField(max_length=255, null=True, blank=True)

class NewsArticle(models.Model):
    source = models.ForeignKey(NewsSource, on_delete=models.CASCADE, related_name='articles')
    author = models.CharField(max_length=255, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    url = models.URLField()
    url_to_image = models.URLField(null=True, blank=True)
    published_at = models.DateTimeField() # This assumes that the datetime is in ISO format and can be parsed directly by Django
    content = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title
