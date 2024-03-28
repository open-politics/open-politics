import pandas as pd
from tqdm import tqdm
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import time

# Step 1: Read the dataset
file = pd.read_csv('articles.csv')

# Step 2: Drop rows with NaN values in 'paragraphs' and 'summary' to ensure clean data
file = file.dropna(subset=['paragraphs', 'summary'])

# Step 3: Filter for summaries of relevant articles and store them in a variable
relevant_summaries = file[(file['relevance'] == 'relevant') & (file['summary'].notna())]['summary'].tolist()

# Check if there are any relevant summaries to process
if not relevant_summaries:
    print("No relevant summaries available for TLDR synthesis.")
else:
    # Step 4: Set up LangChain
    # Define the prompt for synthesizing TLDR from existing summaries
    tldr_prompt_template = ChatPromptTemplate.from_template(
        "You are a political intelligence analyst. Create a TLDR based on the following summaries:\n{summaries}"
    )
    output_parser = StrOutputParser()
    model = ChatOpenAI(model="gpt-4-1106-preview", max_tokens=4000)
    chain = ({"summaries": RunnablePassthrough()} | tldr_prompt_template | model | output_parser)

    # Step 5: Make LangChain call to synthesize TLDR and save to a text file
    start_time = time.time()

    # Invoke the chain with relevant summaries
    tldr = chain.invoke("\n".join(relevant_summaries))

    end_time = time.time()
    execution_time = end_time - start_time
    print(f"TLDR synthesis execution time: {execution_time} seconds")

    # Save the TLDR to a text file
    with open('tldr_summary.txt', 'w') as tldr_file:
        tldr_file.write("TLDR Summary:\n" + tldr)

    print("TLDR summary saved to 'tldr_summary.txt'.")
