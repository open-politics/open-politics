import asyncio
import json
from app.api.v1.locations.country_services.articles import SearchType
from app.api.v1.locations.country_services.articles import get_articles
from app.api.v1.locations.routes import get_geojson_for_article_ids

async def test_get_articles_and_geojson():
    # Fetch articles
    articles = await get_articles("United States", search_type=SearchType.TEXT)
    assert articles is not None, "No articles fetched."
    assert len(articles) > 0, "Fetched articles list is empty."

    # Extract article IDs
    article_ids = [article['id'] for article in articles]
    assert all(isinstance(id, str) for id in article_ids), "Not all article IDs are strings."

    # Fetch GeoJSON data
    geojson_response = await get_geojson_for_article_ids(article_ids)
    assert geojson_response is not None, "GeoJSON response is None."

    # Manually decode the JSON content from the response body
    geojson_content = json.loads(geojson_response.body.decode())
    assert geojson_content is not None, "GeoJSON content is None."
    
    # Check if GeoJSON content has expected keys (optional but recommended)
    assert "type" in geojson_content and geojson_content["type"] == "FeatureCollection", "Invalid GeoJSON structure."

    # Assert that there are features in the GeoJSON
    assert "features" in geojson_content, "GeoJSON does not contain 'features'."
    assert isinstance(geojson_content["features"], list), "'features' is not a list."
    assert len(geojson_content["features"]) > 0, "GeoJSON features list is empty."

if __name__ == "__main__":
    asyncio.run(test_get_articles_and_geojson())
