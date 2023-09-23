# 🚧 UNDER CONSTRUCTION 🚧

## Idea and Outline

Imagine a platform where citizens engage with an LLM (Large Language Model) or teams of LLMs to comprehend proposed policies, their implications, and historical precedents. This aims to democratize access to political knowledge.

**Core Idea:** Reducing the contextual overhead of political processes.

## Tasks
- Information summarization
- Q&A Chatbots (for interactive information)
- Providing historical context
- Monitoring and alerts
- Visual representation of political data
- Fact-checking

## Challenges
- Addressing training data bias
- Effective prompt engineering
- Parsing/formatting outputs

## Frontend
- GUI offers a choice of a "Vorgang" process from the Bundestag.
- Process details are dissected with related information shown in a graph or node manner (akin to Obsidian's graph view).
- Each node features a card that summarizes its content and points to the most relevant related content.
- **Design Tool:** Figma (details coming soon)

## Backend

### Django
- Fetches relevant documents and process details via the DIP API.

### Langchain
- Parses the document structure (e.g., bold text, headlines, lists).
- Summarizes the main document.
- LLM agent decides which sections to summarize and analyze further.
- Analysis identifies and prioritizes mentioned §s to fetch.

### LLM Chains/Agents
- Instruction sets for varied roles and tasks (most likely via dictionary).
- Differentiation between summarizing models and function-calling models (or instances).

## Patterns & Tools of Analysis for LLMs
- **LangChain**
- **Vector Databases:** Chroma or Pinecone

## Referenced Patterns/Papers
- Reflexion
- Tree of Thought

## MVP (Minimum Viable Product)
- A single process with GUI
