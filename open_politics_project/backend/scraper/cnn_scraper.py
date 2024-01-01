import requests
from bs4 import BeautifulSoup
from base_scraper import BaseScraper


class CNNScraper(BaseScraper):
    version = "1.0"

    def get_urls(self):
        response = requests.get(self.base_url)
        soup = BeautifulSoup(response.text, features="html.parser")
        all_urls = []
        for a in soup.find_all('a', href=True):
            if a['href'] and a['href'][0] == '/' and a['href'] != '#':
                a['href'] = self.base_url + a['href']
            all_urls.append(a['href'])
        return all_urls
