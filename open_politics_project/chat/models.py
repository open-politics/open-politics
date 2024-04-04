from django.db import models
from news.models import User
from django.utils import timezone

class Message(models.Model):
    sender = models.CharField(max_length=100, default='Anonymous')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
