from transformers import pipeline

pipe = pipeline("token-classification", model="mdarhri00/named-entity-recognition")

from transformers import AutoTokenizer, AutoModelForTokenClassification
tokenizer = AutoTokenizer.from_pretrained("mdarhri00/named-entity-recognition")
model = AutoModelForTokenClassification.from_pretrained("mdarhri00/named-entity-recognition")

def get_entities(text):
    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    tokens = tokenizer.convert_ids_to_tokens(predicted_ids[0])
    entities = []
    for token in tokens:
        if token.startswith("Ġ"):
            entities.append(token[1:])
    return entities