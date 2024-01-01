import langchain 
from langchain.chat_models import ChatOpenAI
from ...news.models import Conversation, ConversationResponse, ConversationResponseVote
from operator import itemgetter
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema import SystemMessage, ChatMessage
from langchain.schema.runnable import RunnableParallel, RunnablePassthrough
from django.http import StreamingHttpResponse

def query(request, input_text):
    # process input from form and initiate langchain    # return intermediate output  

    prompt1 = ChatPromptTemplate.from_template("""
    Du bist Politikwissenschaftler und gibst einen Abriss über das Thema: {Frage}""")

    model = ChatOpenAI(model="gpt-4-1106-preview")

    chain1 = prompt1 | model | StrOutputParser() | RunnablePassthrough() 

    def stream_generator():
        for s in chain1.stream({"Frage": input_text}):
            yield s

    return StreamingHttpResponse(stream_generator())
