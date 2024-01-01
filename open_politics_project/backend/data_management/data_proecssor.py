import pandas as pd
import requests
from bs4 import BeautifulSoup

class DataProcessor:
    version = "1.0"

    def __init__(self, urls, cleaner):
        self.urls = urls
        self.cleaner = cleaner

    def process_data(self):
        df = pd.DataFrame(self.urls, columns=['url'])
        headline_texts = []
        paragraphs = []

        for url in self.urls:
            response = requests.get(url)
            soup = BeautifulSoup(response.text, features="html.parser")
            headline = soup.find('h1', class_='headline__text')
            headline_texts.append(headline.text.strip() if headline else 'N/A')
            article_paragraphs = soup.find_all('div', class_='article__content')
            cleaned_paragraph = self.cleaner.clean_text(' '.join([p.text.strip() for p in article_paragraphs]))
            paragraphs.append(cleaned_paragraph)

        df['headline'] = headline_texts
        df['paragraphs'] = paragraphs
        return df
