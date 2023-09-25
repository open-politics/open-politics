import os 
import langchain
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import openai
import json

openai.api_key = os.environ.get("OPENAI_API_KEY")

if True:
    with open("vorgangsdaten_buffer.json", "r") as file:
    Vorgangsdaten = json.load(file)


    human_message_prompt = HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                template="Du bist Referent des Bundestags. Bitte fasse den folgenden Vorgang in zwei Sätzen zusammen {vorgang}?",
                input_variables=["vorgang"],
            )
        )

    chat_prompt_template = ChatPromptTemplate.from_messages([human_message_prompt])
    chat = ChatOpenAI(temperature=0.9)
    chain = LLMChain(llm=chat, prompt=chat_prompt_template)
    result = chain.run('vorgang': Vorgangsdaten[0])
    print(result)

    with json.load("vorgangsdaten_summary.json", "w") as outfile:
        json.dump(result, outfile)