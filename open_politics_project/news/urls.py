from django.urls import path
from . import views

urlpatterns = [
    path("test-button", views.test_button, name="test_button"),
    path('api/fetch_articles/', views.fetch_articles_api, name='fetch_articles_api'),
]
