#path chat/serilizers.py
from rest_framework import serializers
from .models import ChatMessages, Conversation

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessages
        fields = '__all__'

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model= Conversation
        fields= '__all__'