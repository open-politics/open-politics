import requests
from bs4 import BeautifulSoup

def extract_news_content(url):
    try:
        # Fetch the content from URL
        response = requests.get(url)
        response.raise_for_status()

        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract headline - usually found in h1, h2, h3, or h4 tags
        headline = ''
        # for tag in ['h1', 'h2', 'h3', 'h4']:
        #     headline_element = soup.find(tag)
        #     if headline_element:
        #         headline = headline_element.get_text().strip()
        #         break

        # Extract all paragraph text excluding 'Link' and 'EditionMenu-featuredListItem'
        paragraphs = []
        if 'cnbc.com' in url:
            paragraphs = [p.get_text().strip() for p in soup.find_all('p') if 'Link' not in p.get_text() and 'EditionMenu-featuredListItem' not in p.get('data-testid', [])]
        else:
            paragraphs = [p.get_text().strip() for p in soup.find_all('p') if 'Link' not in p.get_text() and 'linkitems' not in p.get('class', [])]

        # return {'headline': headline, 'paragraphs': paragraphs}
        return '\n'.join(paragraphs)
    except requests.HTTPError as e:
        print(f"HTTP Error: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def main():
    # Example usage
    url = 'https://www.faz.net/aktuell/wirtschaft/erhoehung-der-luftverkehrsteuer-sorgt-fuer-aerger-19398422.html'
    news_content = extract_news_content(url)

    if news_content:
        # print("Headline: " + news_content['headline'])
        print("----")
        for paragraph in news_content['paragraphs']:
            print(paragraph)
        print("*" * 20)

# Call the main function
