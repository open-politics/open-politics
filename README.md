# 🌐 Open Politics

> "Open Source Political Intelligence" - What is that and why do we need it?  
> 🎬 [Watch Presentation](https://media.ccc.de/v/dg-111)

## About

### Our Vision
Open Politics' vision is to democratise political intelligence.

### Our Mission
We aim to create the first Open Source Intelligence HQ for civic research - helping citizens understand and navigate complex political information through a high-tech stack of efficiently operationalised data science tools to gather, analyse and visualise data.

### Our Goal
To fulfill a wide bandwidth of analysis capabilities that enable citizens and organizations alike to work more efficiently on matters of public interest. Be that news analysis, political advocacy, visual report generation, geospatial data exploration or structured argument extraction and visualization for coalition talks, we build the tools to make sense of this information battlefield out there.

### Project Overview
#### Status
- 📝 **Development**: In late Beta
- 🛜 **Hosted Platform**: Coming soon at [https://open-politics.org](https://open-politics.org)

### Resources
- **This Repository**: The "UX side of things" - making information accessible via visual interfaces
- [**Data Engine "opol"**](https://github.com/open-politics/opol):  handles the "data side of things" including:
  - Data ingestion
  - Geo-tooling
  - AI capabilities

    ...

- **[User Documentation](https://docs.open-politics.org)**  for user guides & tutorials
- **Technical Docs**: 
    - Documentation for this TypeScript NextJS (OP-APP) repository will be updated soon. 
    - Technical documentation for opol is in the [opol repository](https://github.com/open-politics/opol)


### Approach
Our scope aims to research, invent, extend and implement multiple ways to make Open Source Political Intelligence accessible, which is why we are exploring different output modalities. From disability-friendly interfaces to VR Graph analysis, our understanding of the task to make politics accessible extends beyond a globe on a webapp.


## Table of Contents
- [Why Open Politics Exists](#why-open-politics-exists)
- [The Webapp](#the-webapp)
- [Usage/Installation](#usageinstallation)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

As a quick pitch element to get you interested; this is where we are:
![Open Politics Vision](.github/assets/images/opol-data-on-globe.png)
[Opol](https://github.com/open-politics/opol) serves the data for the interactive globe visualisation of this webapp displaying news articles processed through LLM classification, entity extraction, and geocoding for spatial representation

# Why Open Politics Exists
- All things regarding politics, be they news, conflicts or legislative procedures, are hard to keep track of. It's hard to find the time to read through all the documents and news articles necessary to gain a broad and well-informed understanding of political situations. Technology offers great possibilities to make such processes more accessible. Recently, the advent of Large Language Models has extended the capabilities of textual analysis and understanding. Especially the ability to formulate tasks in natural language opens up new possibilities for analysing text data. Potentially revolutionising the way qualitative and quantitative research can be combined.
- This project aims to combine the best of natural language LLM interfacing and classical Data Science methods to build tools that provide a comprehensive overview of political topics, including summaries of news articles, information about political actors, and the relationships between them.

If you're passionate about making politics more accessible and understandable for everyone, we'd love to hear from you! Please reach out to us or show your support by giving us a star on GitHub.



## Usage/Installation
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
