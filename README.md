# 🚧 UNDER CONSTRUCTION 🚧

**Catchphrase:** Reducing politics contextual overhead.

## Table of Contents
- [Why does this project exist?](#why-does-this-project-exist)
- [Idea and Outline](#idea-and-outline)
- [Tasks](#tasks)
- [Data Science/ Code Challenges](#data-science-code-challenges)
- [Journalistic Challenges](#journalistic-challenges)
- [Quality Assurance](#quality-assurance)
- [Frontend](#frontend)
- [Backend](#backend)
- [Usage](#usage)
- [Necessary API Keys/ Environment Variables](#necessary-api-keys-environment-variables)
- [Contributing](#contributing)
- [Contact](#contact)

# Why does this project exist?
- All things regarding politics, be that news or legislative procedures and documents are hard to understand. Many people don't have the time to read through all the documents and news articles.
- The goal of this project is to make political processes more accessible and understandable for everyone.

# Idea and Outline
This project aims to tackle two distinct problems:

1. Navigating political situations, legislative documents, and political processes is difficult and time-consuming.
2. Interacting with this data is often limited to a few experts.

**Solution Components:**
- News (Summarisation)
- Actors & Interests (Matrix)
- Background (filling the training cut-off)
- Hard Data Views (%s, numbers, etc.)
- Timeline View (of processes, events, and news)
- Graph View (of actors, interests, and processes)
- Chatbot (Q&A)
- Outlook (generative)


## Tasks
- Information summarization
- Entity Extraction (Named Entity Recognition)
- Q&A Chatbots (for interactive information)
- Providing historical context 
- Monitoring and alerts
- Visual representation of political data
- Fact-checking

## Data Science/ Code Challenges
- Addressing training data bias
- Effective prompt engineering
- Parsing/formatting outputs
- Training and fine-tuning LLMs

## Journalistic Challenges
- Balanced News Sources
- Fact-checking
- Interdependence of news sources
- Interdependence of summaries

## Quality Assurance
- Automatic Evaluation of Results Pipelines needed (conciseness, accuracy, etc.)



# Frontend

### Vision
![Open Politics Vision](assets/images/open-politics-website-vision.png)

- The frontend rendering and server communication is largely built on htmx features and tries to stay within the realm of HTML and CSS and Hyperstate Media, calling assets asynchronously.


# Backend

### Django

- Django is used as a backend framework to serve the frontend and to communicate with the LLMs.


### Langchain
08.11 Update after OpenAI DevDay:
- the available context length is now 128k tokens, which is a huge improvement
- the ecosystem is now heavily evolving on agents-based sytems
- our purpose will need multple agents, as we need to address different tasks


- Each component requires different solutions
- - Langchain teams, agents, and chains are used to deliver rich and relevant information.
- - Elaborate processes are done with tree tree-of-thought, chain-of-thought and reflexion (see papers).
- - Some tools require automatic code generation (e.g., for the graph or timeline view).
- - Some tools require a more interactive approach (e.g., for the chatbot).
- Sets of instructions are used to generate the output.
- Sets of instructions and sets of data are retrievable via Vecor Storage Querying (e.g., Chroma or Pinecone).


### Database 
- Vector Databases
- SQLite (for current scale)
- Neo4js

## Patterns & Tools of Analysis for LLMs
- Instruction Sets
- Skill/ Instruction Vector Storage
- Voyager Paper Technique


## Referenced Patterns/Papers
- [Reflexion](https://arxiv.org/abs/2303.11366)
- [Tree of Thought](https://arxiv.org/abs/2305.10601)
- [Chain of Thought](https://arxiv.org/abs/2201.11903)
- [Voyager](https://arxiv.org/abs/2305.16291)



## Usage (coming soon):
- Clone the repo
```
git clone https://github.com/JimVincentW/open-politics.git
```
- Install dependencies with
```
pip install -r requirements.txt
```
- Run the Django server
```
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
- Connect to the frontend (open 127.0.0.1:8000 in your browser)
- Run the LLM agent (query the API)


## Necessary API Keys/ Environment Variables:
- DIP API (rgsaY4U.oZRQKUHdJhF9qguHMkwCGIoLaqEcaHjYLF)
- NewsAPI API
- OpenAI API
- Huggingface Token

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make, especially in the form of questions or proposals, are greatly appreciated.

- If you have a question or proposal, please feel free to add it as an issue in the GitHub repository.
- If you're looking to contribute directly to the code base, please approach via email so we can set up a team or arrange a discussion.


## Contact

For any inquiries, questions, or proposals, please feel free to reach out at jimvwagner@googlemail.com. I'm open to discussions and collaborations!

## License
- [MIT](https://choosealicense.com/licenses/mit/)