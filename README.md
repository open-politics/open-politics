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
05.06.2024: The Django backend is now replaced by a FastAPI backend (a fork of Tiangolo's highly functional Fullstack Template). The frontend is now a Next.js app using shadcn as a UI library, amcharts for the globe and axios data fatches to the backend. 

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
### FastAPI
- We are transitioning away from Django and using a FastAPI backend now. The structure and configuration is largely based on Tiangolo's Fullstack Template ([https://github.com/tiangolo/full-stack-fastapi-template](https://github.com/tiangolo/full-stack-fastapi-template))
 

## Usage (better build script upcoming)
- Clone the repo
```
git clone https://github.com/JimVincentW/open-politics.git
```
- Run start script
```
./start.sh
```

## Necessary API Keys/Environment Variables:
- DIP API (rgsaY4U.oZRQKUHdJhF9qguHMkwCGIoLaqEcaHjYLF)
- OpenAI API
- Huggingface Token
- Tavily API Key

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make, are greatly appreciated.
- If you have a question or idea, please feel free to add it as an issue in the GitHub repository.
- If you're looking to contribute directly to the code base, please approach via email so we can set up a discussion.

## Contact
jimvw@open-politics.org

## License
- [MIT](https://choosealicense.com/licenses/mit/)