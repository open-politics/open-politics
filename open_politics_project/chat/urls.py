from django.urls import path
from . import views

urlpatterns = [
    path('', views.chat, name='chat'),
    path('send-message/', views.send_message, name='send_message'),
]
