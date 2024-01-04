from arb_cnn_scraper import scrape_cnn_articles
from ner_tagging import predict_ner_tags

df = scrape_cnn_articles()

for i, row in df.head(2).iterrows():
    print('Headline: ' + row['headline'])
    print('Content: ' + row['paragraphs'])
    print('***' * 10)

    ner_tags = predict_ner_tags(row['paragraphs'])
    print(ner_tags)
    print('***' * 30)
    