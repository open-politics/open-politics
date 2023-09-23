🚧 UNDER CONSTRUCTION 🚧

**Idea and Outline of the project**

Imagine a platform where citizens could engage with an LLM or Teams of LLMs to understand proposed policies, their implications, and historical precedents. Such platforms could democratize access to political knowledge.

Core Idea: Readucing the contextual overhead of political processes

Tasks:
- Information summarisation
- Q&A Chatbots (interactive information)
- Historical Context
- Monitoring and Alerts
- Visual representation of pol. Data
- Fact-checking

Challenges:
- Training Data Bias
- Prompt Engineering
- Parsing/ Formating outputs

***Frontend:***
- GUI with the ability to choose from a process "Vorgang" of the Bundestag.
- The process details will be dissected and presented with related information presented in a graph/ node kind of way (similar to obsidian graph view).
- Each Node will be have a card summarising its content and point to the most relevant related content/

Design:
Figma (coming soon)


***Backend:***

Django:
- fetching relevant documents and process details via DIP api


Langchain:
- parsing the document structure (bold text, headlines, lists)
- summarising main document
- LLM agent chooses which parts to summarise analyse further
- analysis should return mentioned §s and decide which are important to fetch


LLM Chains/ Agents:
0. Instruction sets for different roles and tasks (likely via dict)
1. differentiation between summarising models and function calling models (or better instances)


Patterns & Tools of Anlaysis for Large Language Models
Tools: 
- LangChain
- Vector Databases (Chroma or Pinecone)

Patterns/ Papers:
- Reflexion
- Tree of Thought




MVP:
- 1 Process with GUI