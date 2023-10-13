# Imports
from transformers import pipeline
import requests
import networkx as nx
import matplotlib.pyplot as plt
import os
import pandas as pd
import plotly.express as px
import openai



# Query
language = 'us'
query = 'Israel'
pageSize = 40

# Load the NER pipeline
pipe = pipeline("token-classification", model="mdarhri00/named-entity-recognition")

# Query News API
api_key = os.environ.get('NEWS_API_KEY')
url = 'https://newsapi.org/v2/top-headlines'

def call_with_search_parameters(options):
    call_parameters = {
        'country': options.get('country'),
        'category': options.get('category'),
        'sources': options.get('sources'),
        'q': options.get('q'),
        'pageSize': options.get('pageSize', 20),
        'page': options.get('page', 1)
    }
    # Filter out None values to prevent sending empty parameters
    call_parameters = {k: v for k, v in call_parameters.items() if v is not None}

    response = requests.get(url, params=call_parameters, headers={'Authorization': f'Bearer {api_key}'})
    print(response)
    if response.status_code == 200:
        json_data = response.json()
        if 'articles' in json_data:
            articles = json_data['articles']
            df = pd.DataFrame(articles, columns=['source', 'author', 'title', 'description', 'url', 'urlToImage', 'publishedAt', 'content'])
            print(df)
            for article in articles:
                source = article.get('source', {}).get('name', None)
                title = article.get('title')
                content = article.get('content')
                if not title or not content:
                    print(f"Warning: Missing title or content in article {article['title']}")
                    continue
                # print(f"Source: {source}")
                # print(f"Title: {title}")
                # print(f"Content: {content}")
                # print("-" * 50)  # Print a separator for better readability
            return df
        else:
            print("Unexpected API response:", json_data)
            return pd.DataFrame()

def get_entities(df):
    HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
    API_URL = "https://api-inference.huggingface.co/models/mdarhri00/named-entity-recognition"
    headers = {"Authorization": "Bearer " + HUGGINGFACE_TOKEN}
    
    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()
    
    df['entities'] = None

    for idx, row in df.iterrows():
        article_text = row['content']

        if article_text:  # this will check if article_text is not None or not NaN
            output = query({"inputs": article_text})
            df.at[idx, 'entities'] = output
    return df

# BAR Chart (Deprecated)
def visualize_dataframe(df):
    # 1. Bar Chart for Entity Frequencies
    all_entities = [entity['entity_group'] for entities in df['entities'].dropna() for entity in entities]
    entity_freq = pd.Series(all_entities).value_counts()

    fig, ax = plt.subplots(nrows=2, ncols=1, figsize=(10, 12))

    entity_freq.plot(kind='bar', ax=ax[0], color='skyblue')
    ax[0].set_title("Frequency of Entities")
    ax[0].set_ylabel("Count")
    ax[0].set_xlabel("Entity")
    ax[0].tick_params(axis='x', rotation=45)

    # 2. Boxplot for Entity Scores
    scores_data = {label: [] for label in entity_freq.index}
    
    for entities in df['entities'].dropna():
        for entity in entities:
            scores_data[entity['entity_group']].append(entity['score'])
    
    ax[1].boxplot(scores_data.values(), vert=False, patch_artist=True)
    ax[1].set_yticklabels(scores_data.keys())
    ax[1].set_title("Distribution of Scores for Each Entity")
    ax[1].set_xlabel("Score")
    
    plt.tight_layout()
    plt.show()

# Scatter Plot (Deprecated)
def visualize_entities(df):
    # Extracting entities and scores to be visualized
    data = []
    for i, row in df.iterrows():
        content = row['content']
        entities = row['entities']
        for entity in entities:
            data.append({
                'content': content,
                'entity': entity['entity_group'],
                'score': entity['score'],
                'start': content.find(entity['entity_group']),
                'end': content.find(entity['entity_group']) + len(entity['entity_group'])
            })

    # Convert to DataFrame for visualization
    viz_df = pd.DataFrame(data)

    # Scatter plot using Plotly
    fig = px.scatter(viz_df, x='entity', y='content', text='entity', size='score', hover_data=['score'])

    # Styling the plot
    fig.update_traces(textposition='top center')
    fig.update_layout(
        title="Entities in Content with Scores",
        xaxis_title="Entity",
        yaxis_title="Content",
        showlegend=False
    )

    # Displaying the plot
    fig.show()

# Network Graph (Deprecated)
def visualize_entity_article_connections(entities, articles):


    G = nx.Graph()
    
    # Add entity nodes
    for entity in entities:
        G.add_node(entity['word'], type='entity', score=entity['score'])

    # Add article nodes
    for article in articles:
        G.add_node(article, type='article')
        
        # Connect entity nodes to the article node if the entity is mentioned in the article
        for entity in entities:
            if entity['word'] in article:
                G.add_edge(entity['word'], article)
                
    pos = nx.spring_layout(G)
    plt.figure(figsize=(12, 8))
    
    # Draw entity nodes with size based on their score
    entity_nodes = [node for node, attr in G.nodes(data=True) if attr['type'] == 'entity']
    nx.draw_networkx_nodes(G, pos, nodelist=entity_nodes, node_size=[G.nodes[node]['score'] * 3000 for node in entity_nodes], node_color='lightgray')
    
    # Draw article nodes
    article_nodes = [node for node, attr in G.nodes(data=True) if attr['type'] == 'article']
    nx.draw_networkx_nodes(G, pos, nodelist=article_nodes, node_size=1000, node_color='white')
    
    # Draw edges
    nx.draw_networkx_edges(G, pos)
    
    # Draw labels
    nx.draw_networkx_labels(G, pos)
    
    plt.axis('off')
    plt.show()

def visualize_avg_scores(df):
    # Extracting entities, scores, content, and entity values for visualization
    data = []
    for i, row in df.iterrows():
        content = row['content']
        entities = row['entities']
        for entity in entities:
            data.append({
                'content': content,
                'entity_group': entity['entity_group'],
                'entity_value': entity['word'],  # Assuming you have the 'value' key for the entity's text
                'score': entity['score']
            })

    # Convert to DataFrame for further processing
    viz_df = pd.DataFrame(data)

    # Compute average score and collect articles for each unique entity label and value
    grouped = viz_df.groupby(['entity_value', 'score']).agg({
        'score': 'mean',
        'content': list
    }).reset_index()

    # Convert list of articles to a single string for hover data
    grouped['hover_text'] = grouped.apply(lambda x: f"{x['entity_value']} (Avg. Score: {x['score']:.2f})\n\n" + "\n\n".join(x['content']), axis=1)

    # Scatter plot using Plotly
    fig = px.scatter(grouped, x='entity_group', y='score', text='entity_value', hover_data=['hover_text'])

    # Styling the plot
    fig.update_traces(textposition='top center')
    fig.update_layout(
        title="Average Scores for Entities with Related Passages",
        xaxis_title="Entity Group",
        yaxis_title="Average Score",
        showlegend=False
    )

    # Displaying the plot
    fig.show()

def visualize_query_entity_network(df, query):
    # Initialize a new graph
    G = nx.Graph()
    
    # Add a central node for the query term
    G.add_node(query, type='query', size=3000)

    # For each row in the dataframe (article)
    for _, row in df.iterrows():
        # For each entity in the entities column
        for entity in row['entities']:
            entity_word = entity['word']
            entity_score = entity['score']

            # Check if this entity node already exists, if not, add it
            if entity_word not in G.nodes():
                G.add_node(entity_word, type='entity', size=entity_score*5000, color=score_to_color(entity_score))
            
            # Add an edge between the query and the entity if it does not exist already
            if not G.has_edge(query, entity_word):
                G.add_edge(query, entity_word)
                
    pos = nx.spring_layout(G)
    plt.figure(figsize=(12, 8))
    
    # Draw the central query node
    nx.draw_networkx_nodes(G, pos, nodelist=[query], node_color='orange', node_size=G.nodes[query]['size'])
    
    # Draw entity nodes
    entity_nodes = [node for node, attr in G.nodes(data=True) if attr['type'] == 'entity']
    node_colors = [G.nodes[node]['color'] for node in entity_nodes]
    node_sizes = [G.nodes[node]['size'] for node in entity_nodes]
    nx.draw_networkx_nodes(G, pos, nodelist=entity_nodes, node_color=node_colors, node_size=node_sizes)
    
    # Draw edges
    nx.draw_networkx_edges(G, pos, width=0.5, alpha=0.6)
    
    # Draw labels
    nx.draw_networkx_labels(G, pos, font_size=8)
    
    plt.axis('off')
    plt.title(f"Entities related to query: {query}")
    plt.show()

def score_to_color(score):
    # Convert the score to a color
    # Here, we're assuming higher scores are "better" and will make the color more towards green
    return (1 - score, score, 0.5) 


def most_important_entities(df):
    for index, row, score in df.iterrows():
        print(row['entities'][0]['entity_group'])
        print(row['entities'][0]['score'])
        print(row['entities'][0]['word'])

def most_important_news_for_entity(df, articles):
    template = """"
    These following are the most important news articles about {entity} from the last 24 hours.
    Write a 3 sentence summary for what is important to know right now.
    Also write down their historic relation to other entities.
    Here are the articles: {articles}.
    And here are the other entities: {entities}.
    """
    articles = []
    entities = []
    for index, row in df.iterrows():
        articles.append(row['title'])
        entities.append(row['entities'][0]['word'])
    entity = row['entities'][0]['entity_group']

    openai.api_key = os.getenv("OPENAI_API_KEY")
    llm = openai.ChatCompletion.create(
        model="gpt-4",
        messages = [{"role": "system", "content": 'You are a political news journalist tasked with Named Entity Recognition and Entity linking tasks.'},
                    {"role": "user", "content": "These following are the articles about" + entity + "from the last 24 hours. Please give a short summary about what is important right now to know about this matter. No more than 3 sentences and just the plain answer." },
                    {"role": "assistant", "Ok, show me the articles please": }
                    {"role": "user", "content": "Here are the articles:" + articles },]


    )



def main():
    df = call_with_search_parameters({'country': language, 'q': query, 'pageSize': pageSize})
    df = get_entities(df)
    #visualize_dataframe(df)
    #visualize_entities(df)
    #visualize_avg_scores(df)
    #visualize_query_entity_network(df, query)
    most_important_entities(df)
    print(df['entities'])
    print(df.iloc[0])

    return df



if __name__ == '__main__':
    main()
