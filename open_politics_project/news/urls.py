from django.urls import path, include
from .views import ArticleListView  # Make sure to import the class-based view
from . import views
from django.contrib import admin

urlpatterns = [
    path('news/', views.news_home, name="news_home"),
    path('news_home/', views.news_home, name="news_home"),
    path('test-button', views.test_button, name="test_button"),
    path('api/fetch_articles/', views.fetch_articles_api, name='fetch_articles_api'),
    path('articles/', ArticleListView.as_view(), name='article_list'),
]
