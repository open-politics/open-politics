from django.urls import path, include
from .views import ArticleListView  # Make sure to import the class-based view
from . import views
from django.contrib import admin

urlpatterns = [
    path('news/', views.news_home, name="news_home"),
    path('articles/', ArticleListView.as_view(), name='article_list'),
    path('visualize/', views.news_home, name='news_home'),
    path('news_synopsis/', views.stream_synopsis, name='stream_synopsis'),
    path('news_actors/', views.stream_actors, name='stream_actors'),
    path('query/', views.query, name='query'),
    path('tools', views.tools, name='tools'),
    
]
