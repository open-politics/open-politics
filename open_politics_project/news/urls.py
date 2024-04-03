from django.urls import path, include
from django.contrib.auth.views import LogoutView, LoginView
from news.views.old_views import SignUpView, custom_login_view, ArticleListView
from django.contrib import admin
from news.views import *

views = old_views
module_views = module_views
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from langchain.llms import OpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory


class ChatbotView(APIView):
    def post(self, request):
        # Get user input from request
        user_input = request.data.get('input')
        
        # Initialize LLM
        llm = OpenAI(temperature=0.9) 
        
        # Initialize memory
        memory = ConversationBufferMemory(memory_key="chat_history")
        
        # Initialize the ConversationChain
        conversation = ConversationChain(
            llm=llm, 
            memory=memory,
            verbose=True
        )
        
        # Generate response
        response = conversation.predict(input=user_input)
        
        return Response({"response": response})

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
    path('fetch-tldr/', module_views.tldr_view, name='fetch_tldr'),
    path('faq/', views.faq, name='faq'),
    path('chatbot/', module_views.chatbot, name='chatbot'),
]