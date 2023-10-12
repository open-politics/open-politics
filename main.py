# Imports
from transformers import pipeline
import requests
import networkx as nx
import matplotlib.pyplot as plt
import os
import pandas as pd


# Query
language = 'us'
query = 'Israel'
pageSize = 20

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



def get_entities(article_text):
    HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
    API_URL = "https://api-inference.huggingface.co/models/mdarhri00/named-entity-recognition"
    headers = {"Authorization": "Bearer" + HUGGINGFACE_TOKEN}
    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()
        
    output = query({
        "inputs": article_text,
    })
    print(output)
    return output



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


def main():
    call_with_search_parameters({'country': language, 'q': query, 'pageSize': pageSize})



if __name__ == '__main__':
    main()
