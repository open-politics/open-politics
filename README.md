🚧 UNDER CONSTRUCTION 🚧

**Idea and Outline of the project**

Frontend:
- GUI with the ability to choose from a process "Vorgang" of the Bundestag.
- The process details will be dissected and presented with related information presented in a graph/ node kind of way (similar to obsidian graph view).
- Each Node will be have a card summarising its content and point to the most relevant related content/

Backend:

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




MVP:
- 1 Process