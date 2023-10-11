from django.urls import path
from . import views

urlpatterns = [
    path('process/', views.process_view, name='process'),
    path('receive-url/', views.receive_url_api, name='receive_url'),
    path('receive-url/<int:id>/', views.receive_url_api, name='receive_url'),
]


