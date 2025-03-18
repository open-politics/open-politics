#### 🚧 UNDER CONSTRUCTION 🚧
# 🌐 Open Politics 
> "Open Source Political Intelligence" - What is that and why do we need it?  
🎬 [Watch Presentation](https://media.ccc.de/v/dg-111)
### Webapp of the Open Politics Project
 

### Onboarding
Open Politics' vision is to democratise political intelligence. 

We are on a mission to decode the globe by creating an open-source data science and AI toolkit to analyse, summarise, and visualise political information.

For our data engine **opol** please look [here](https://github.com/open-politics/opol)

Documentation for this repository, which concentrates heavily on the Typescript NextJS (OP-APP) app will be updated soon. Until then please read into the opol repository.

## Table of Contents
- [Why Open Politics Exists](#why-open-politics-exists)
- [Update: opol Release](#update-opol-release)
- [The Webapp](#the-webapp)
- [Engage! Developer Jour Fixe](#engage-developer-jour-fixe)
- [Tasks](#tasks)
- [AI Models](#ai-models)
- [Data Challenges](#data-challenges)
- [Journalistic Challenges](#journalistic-challenges)
- [Quality Assurance](#quality-assurance)
- [Architecture](#architecture)
- [Usage](#usage)
- [Necessary API Keys/Environment Variables](#necessary-api-keysenvironment-variables)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

As a quick pitch element to get you interested; this is where we are:
![Open Politics Vision](.github/assets/images/opol-data-on-globe.png)
[Opol](https://github.com/open-politics/opol) serves the data for the interactive globe visualization of this webapp displaying news articles processed through LLM classification, entity extraction, and geocoding for spatial representation

# Why Open Politics Exists
- All things regarding politics, be they news, conflicts or legislative procedures, are hard to keep track of. It's hard to find the time to read through all the documents and news articles necessary to gain a broad and well-informed understanding of political situations. Technology offers great possibilities to make such processes more accessible. Recently, the advent of Large Language Models has extended the capabilities of textual analysis and understanding. Especially the ability to formulate tasks in natural language opens up new possibilities for analysing text data. Potentially revolutionising the way qualitative and quantitative research can be combined.
- This project aims to combine the best of natural language LLM interfacing and classical Data Science methods to build tools that provide a comprehensive overview of political topics, including summaries of news articles, information about political actors, and the relationships between them.
- The goal of this project is to make politics more accessible and understandable for everyone.




## Usage/ Installation
## Clone the repository
```bash
git clone https://github.com/open-politics/open-politics.git
```

## Change .env.example to .env
```bash
cd open-politics
mv .env.example .env
```

## Run the docker compose file
```bash
docker compose up
```

## Go to the app
### Log in

With the .env account set as superuser:
```bash 
http://localhost:3000/accounts/login
```
```bash 
FIRST_SUPERUSER=example@example.com
FIRST_SUPERUSER_PASSWORD=example
```
### Home
Click on "Desk" in the header or go to
```bash
http://localhost:3000/desks/home
```
### Globe
If you run this in combination with a [local opol stack](https://github.com/open-politics/opol/blob/main/opol/stack/README.md) and your opol had a few minutes to boot up you can visit the globe interface on:
```bash 
http://localhost:3000/desks/home/globe
```