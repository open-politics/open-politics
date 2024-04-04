from django.shortcuts import render
from .models import Message
from langchain import OpenAI
from langchain.chains import ConversationChain

def chat(request):
    messages = Message.objects.all()
    return render(request, 'chat.html', {'messages': messages})

def send_message(request):
    if request.method == 'POST':
        sender = request.POST.get('sender')
        content = request.POST.get('content')
        
        # Save the user's message to the database
        Message.objects.create(sender=sender, content=content)
        
        # Use LangChain to generate a response
        llm = OpenAI(temperature=0.9)
        conversation = ConversationChain(llm=llm, verbose=True)
        ai_response = conversation.predict(input=content)
        
        # Save the AI's response to the database
        Message.objects.create(sender='AI', content=ai_response)
        
        return render(request, 'message_list.html', {'messages': Message.objects.all()})
