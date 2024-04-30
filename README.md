#### 🚧 UNDER CONSTRUCTION 🚧
# 🌐 Open Politics 
## Open Source Political Intelligence
![Open Politics Political Intelligence Vision](assets/images/political_intelligence.png)

### Onboarding:
Open Politics' vision is to democratise political intelligence. 

The mission is to create an open-source data science and AI toolkit to analyse, summarise, and visualise political information.

## Table of Contents
- [Why Open Politics Exists](#why-open-politics-exists)
- [Update: SSARE Release](#update-ssare-release)
- [The Webapp](#the-webapp)
- [Engage! Developer Jour Fixe](#engage-developer-jour-fixe)
- [Tasks](#tasks)
- [AI Models](#ai-models)
- [Data Challenges](#data-challenges)
- [Journalistic Challenges](#journalistic-challenges)
- [Quality Assurance](#quality-assurance)
- [Architecture](#architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database(s)](#databases)
  - [Agent Systems](#agent-systems)
- [Usage](#usage)
- [Necessary API Keys/Environment Variables](#necessary-api-keysenvironment-variables)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

As a quick pitch element to get you interested; this is where we are going:

![Open Politics Vision](assets/images/open_globe_1.png)


# Why Open Politics Exists
- All things regarding politics, be they news, conflicts or legislative procedures, are hard to keep track of. Its hard to find the time to read through all the documents and news articles necessary to gain a broad and well-informed understanding of political situations. Technology offers great possibilities to make such processes more accessible. Recently, the advent of Large Language Models has extended the capabilities of textual analysis and understanding. Especially the ability to formulate tasks in natural language opens up new possibilities for analysing text data. Potentially revolutionising the way qualitative and quantitative research can be combined.
- This project aims to combine the best of natural language LLM interfacing and classical Data Science methods to build tools that provide a comprehensive overview of political topics, including summaries of news articles, information about political actors, and the relationships between them.
- The goal of this project is to make politics more accessible and understandable for everyone.

### Update: SSARE Release
#### [SSARE - (Semantic Search Article Recommendation Engine)](https://github.com/JimVincentW/SSARE)
SSARE is Open Politics' data aggregation system and vector storage endpoint. It aims to create up-to-date and relevant datasets for the LLMs to work with. A microservice infrastructure continuously scrapes news sites and stores them in a vector storage and a relational database (Postgres). Sources can be added with Python scripts which yield a dataframe with: URL | Headline | Paragraphs | Source. Just clone the service, add your scripts and bring your own data endpoint into production.

### The Webapp:
This Django Webapp should basically run scripts and hack together HTMX template renderings. The idea is a collection of analysis scripts.
The requirements for each script and their underlying methods can be very different in their nature. 
Also, the community should be able to contribute their own scripts and tools. Javascript is too much overhead for this project. HTMX is a great way to render the output of these scripts in a clean and fast way, and everybody can just contribute their methods with full HTML designs.
We will shortly release a contribution tutorial how you can pack your script and connect it to the platform.

## Want to engage? Look into our Developer Jour Fixe!
- Interested in the project? Want to contribute? Share a thought?
- Every Wednesday 15:30 Berlin Time
- [Discord Server](https://discord.gg/KAFPp2KQ?event=1219348620860588123)
Join and talk about the project, ask questions, propose ideas, or just listen in.  
Currently needed:
- Data Scraper Modules 
- Interdisciplinary collaboration on the instruction sets for the LLMs 
- Prompt Engineering suggestions
- Frontend/UX/UI work

## Tasks
MVP Elements:
- Issue Area Identification
- Actor Identification / Named Entity Recognition
- Stance Triangulation

Including but not limited to tasks like:
- Information summarization
- Vector storage & retrieval 
- Information clustering
- Entity Extraction (Named Entity Recognition)
- Q&A Chatbots (for interactive information)
- Providing historical context 
- Statement & Intention decoding
- Visual representation of political data
- Monitoring and alerts
- Fact-checking (information triangulation)

## AI Models
- Open-Source is our friend.
- Developing consistent and reliable AI methods is hard with API based models. We thus aim to use open-source models and frameworks, e.g. Ollama and Huggingface for model inference and Langchain for prompt engineering.
- More concrete information on the actual setup is laid out in the [Architecture](#architecture) section.


## Data Challenges
- Addressing training data bias
- Effective prompt engineering
- Creating Datasets & Benchmarks
- Robust and scalable data pipelines
- Training and fine-tuning LLMs

## Journalistic Challenges
- Balanced News Sources
- Fact-checking
- Interdependence of news sources
- Interdependence of summaries

## Quality Assurance
- Automatic Evaluation of Results Pipelines needed (conciseness, accuracy, bias weighting etc.)

# Architecture
## Frontend
#### The Challenge
A fundamental challenge this project has to tackle is how to make information and insights accessible.
The vision and current UI are meant to try delivering such information from a new angle.

### Vision
![Open Politics Vision](assets/images/open_globe_1.png)

The "Open Globe" Interface is set out to display articles and events interactively on a globe.
It should enable to brose global news exploratively.
Heatmap events, timeseries/ timeline scrolling and filer for issue areas are also on the roadmap.

### Current UI
![Open Politics Vision](assets/images/dashboard.png)

This interface enable you to formulate two questions in natural language and retrieve relevant articles, extracted issue areas and a contextualisation of the issue areas.

- The frontend rendering and server communication is largely built on HTMX features and tries to stay within the realm of HTML, CSS, and Hyperstate Media, calling assets asynchronously.

## Backend
### Django
- Django is used as a backend framework to serve the frontend and to communicate with the LLMs.
- Views render data. If you need to rawdog, build a Python script that outputs and parses into a dataframe, JSON, or directly into Django views - we will find a way to integrate it.

### Database(s)
- Intermediate article data storage (SQLite)
- Vector storage (Qdrant) in SSARE data engine
)

### Agent Systems
- The LLM domain AI is now heavily evolving on agent-based systems.
  - LLM Agent teams and chains are used to deliver rich and relevant information.
  - Elaborate processes are done with tree-of-thought, chain-of-thought, and reflection (see papers).
  - Some tools require automatic code generation (e.g., for the graph or timeline view).
  - Agent systems need their own modular tools (like search functions, data connectors, data pipelines, data storage, etc.).
  - Sets of instructions are used to generate the output.
  - Sets of instructions and sets of data are retrievable via Vector Storage Querying (Qdrant).

#### LangChain
- Langchain is a very well-integrated and powerful framework for LLM interaction and chaining.
- Many state-of-the-art prompt engineering techniques are implemented in Langchain.
- Data connectors and data pipelines are widely available.

#### Marvin
- Marvin is a lightweight and powerful framework for LLM-centered classification and validation systems, like Pydantic for LLMs.

## Referenced Patterns/Papers (will be extended in a blog article)
- [Reflexion](https://arxiv.org/abs/2303.11366)
- [Tree of Thought](https://arxiv.org/abs/2305.10601)
- [Chain of Thought](https://arxiv.org/abs/2201.11903)

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

## Necessary API Keys/Environment Variables:
- DIP API (rgsaY4U.oZRQKUHdJhF9qguHMkwCGIoLaqEcaHjYLF)
- NewsAPI API
- OpenAI API
- Huggingface Token
- Agent-Search API

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make, especially in the form of questions or proposals, are greatly appreciated.
- If you have a question or proposal, please feel free to add it as an issue in the GitHub repository.
- If you're looking to contribute directly to the code base, please approach via email so we can set up a team or arrange a discussion.

## Contact
For any inquiries, questions, or proposals, please feel free to reach out at jimvwagner@googlemail.com. I'm open to discussions and collaborations!

## License
- [MIT](https://choosealicense.com/licenses/mit/)