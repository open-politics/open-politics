import langchain
import langchain_decorators
from langchain.agents import load_tools
from langchain_decorators import llm_function, llm_prompt, GlobalSettings
import os
from typing import List, Union, Callable
from langchain.schema.output_parser import StrOutputParser
from langchain.tools import BaseTool
from langchain.document_loaders import AsyncChromiumLoader
from langchain.document_transformers import BeautifulSoupTransformer

os.environ["SEARCHAPI_API_KEY"] = "jC8GsfztPNP1e45xpc8GWKiV"

@llm_function
def send_message(message:str, addressee:str=None, message_type:str="email"):
    """ Use this if user asks to send some message

    Args:
        message (str): message text to send
        addressee (str): email of the adressese... in format firstName.lastName@company.com
        message_type (str, optional): enum: ["email"|"whatsapp"]
    """

    if message_type=="email":
        send_email(addressee, message)
    elif message_type=="whatsapp":
        send_whatsapp(addressee, message)


list_of_other_tools = load_tools(
    tool_names= ['searchapi'],
    llm=GlobalSettings.get_current_settings().default_llm)

loader = AsyncChromiumLoader(["https://www.wsj.com"])
html = loader.load()
bs_transformer = BeautifulSoupTransformer()
docs_transformed = bs_transformer.transform_documents(
    html, tags_to_extract=["p", "li", "div", "a"]
)
docs_transformed[0].page_content[0:-1]



@llm_prompt
def do_what_user_asks_for(user_input:str, functions:List[Union[Callable,BaseTool]]):
    """ 
    ``` <prompt:system>
    Your role is to be a helpful asistant.
    ```
    ``` <prompt:user>
    {user_input}
    ```
    """

user_input="Yo, send an email to John Smith that I will be late for the meeting"
result = do_what_user_asks_for(
        user_input=user_input, 
        functions=[send_message, *list_of_other_tools]
    )

if result.is_function_call:
    result.execute()
else:
    print(result.output_text)