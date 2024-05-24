# urls.py

from django.urls import path, include
from django.contrib.auth.views import LogoutView, LoginView
from news.views.old_views import SignUpView, custom_login_view, ArticleListView
from django.contrib import admin
from news.views import *
from django.urls import re_path
from django.conf.urls.static import static
from django.conf import settings
# import URLRouter

from django.urls import path, re_path
import django_eventstream

views = old_views
module_views = module_views
api_views = api_views

urlpatterns = [
    path('news/', views.news_home, name="news_home"),
    path('articles/', ArticleListView.as_view(), name='article_list'),
    path('visualize/', views.news_home, name='news_home'),
    path('news_synopsis/', views.stream_synopsis, name='stream_synopsis'),
    path('news_actors/', views.stream_actors, name='stream_actors'),
    path('query/', views.query, name='query'),
    path('tools', views.tools, name='tools'),
    path('chat/', views.chat),
    path('chat/delete/', views.delete_conversation),
    path('chat/get-titles', views.get_title),
    path('chat/get-data/', views.get_data),
    path('accounts/', include('django.contrib.auth.urls')),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/', custom_login_view, name='login'),
    path('about/', views.about, name='about'),
    # path('fetch-tldr/', module_views.tldr_view, name='fetch_tldr'),  # Ensure this is commented out
    path('faq/', views.faq, name='faq'),
    path('dashboard/', module_views.dashboard, name='dashboard'),
    path('globe/', module_views.globe, name='globe'),
    path('user_guide/', module_views.user_guide, name='user_guide'),
    path('news_blog/', module_views.news_blog, name='news_blog'),
    path('globe_test/', module_views.globe_test, name='globe_test'),

    # next/react test
    path('react/', module_views.react_index, name='react_index'),
    path('geojson/', module_views.geojson_view, name='geojson_view'),
    path('country_from_query/', module_views.country_from_query, name='country_from_query'),
    path('api/leaders/', module_views.get_leaders, name='get_leaders'),

    path('api/leaders/', api_views.get_leaders, name='get_leaders'),
    path('api/countries/<str:state>/leaders/', api_views.get_leader_info, name='get_leader_info'),
    path('api/countries/<str:state>/legislation/', api_views.get_legislation_data, name='get_legislation_data'),
    path('api/countries/<str:state>/econ_data/', api_views.get_econ_data, name='get_econ_data'),


    # Functional Urls
    re_path(r'^multi-query/$', module_views.multi_query, name='multi-query'),
    re_path(r'^execute/$', module_views.execute, name='execute'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
