class URLFilter:
    version = "1.0"

    @staticmethod
    def is_valid_article(url, current_year='2023'):
        return 'cnn.com/{}/'.format(current_year) in url and '/gallery/' not in url
