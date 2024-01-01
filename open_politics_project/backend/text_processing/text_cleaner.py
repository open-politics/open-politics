import re

class TextCleaner:
    version = "1.0"

    @staticmethod
    def clean_text(text):
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text
