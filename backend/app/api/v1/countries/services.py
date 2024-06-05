import requests
import json
from .schemas import CountryResponse
from bs4 import BeautifulSoup


def update_leaders(request):
    url = "https://en.wikipedia.org/wiki/List_of_current_heads_of_state_and_government"
    response = requests.get(url, verify=False)
    html_content = response.text

    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', {'class': 'wikitable sortable plainrowheaders sticky-header'})

    leaders = []

    def get_wikipedia_image_url(page_title):
        api_url = f"https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "titles": page_title,
            "prop": "pageimages",
            "pithumbsize": 500
        }
        response = requests.get(api_url, params=params).json()
        pages = response['query']['pages']
        for page_id, page_data in pages.items():
            if 'thumbnail' in page_data:
                return page_data['thumbnail']['source']
        return None

    for row in table.find_all('tr'):
        cells = row.find_all(['th', 'td'])
        if len(cells) >= 3:
            state = cells[0].get_text(strip=True)
            head_of_state = cells[1].get_text(strip=True)
            head_of_government = cells[2].get_text(strip=True)

            head_of_state_name = head_of_state.split('–')[-1].strip()
            head_of_government_name = head_of_government.split('–')[-1].strip()

            head_of_state_image = get_wikipedia_image_url(head_of_state_name)
            head_of_government_image = get_wikipedia_image_url(head_of_government_name)

            leaders.append({
                'State': state,
                'Head of State': head_of_state_name,
                'Head of State Image': head_of_state_image,
                'Head of Government': head_of_government_name,
                'Head of Government Image': head_of_government_image
            })

    # Save the leaders data to a JSON file in the static directory
    with open('/static/countries/leaders.json', 'w') as file:
        json.dump(leaders, file)

    return leaders
