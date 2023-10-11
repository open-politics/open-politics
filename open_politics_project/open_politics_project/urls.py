"""
URL configuration for open_politics_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve
from bt_thema import views as bt_thema_views
from news import views as news_views
from news import urls as news_urls
from bt_thema import urls as bt_thema_urls




urlpatterns = [
    path('admin/', admin.site.urls),
    #path('process/', views.process_view, name='process'),
    path('receive-url/', bt_thema_views.receive_url, name='receive_url'),
    path('receive-url/<int:id>/', bt_thema_views.receive_url, name='receive_url'),
    re_path(r'^\.well-known/acme-challenge/(?P<path>.+)$', serve, {
        'document_root': '/var/www/letsencrypt/',
    }),
] + news_urls.urlpatterns + bt_thema_urls.urlpatterns
