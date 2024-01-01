import requests
from bs4 import BeautifulSoup

class BaseScraper:
    version = "1.0"

    def __init__(self, base_url):
        self.base_url = base_url

    def get_urls(self):
        raise NotImplementedError("This method should be implemented in a subclass")
