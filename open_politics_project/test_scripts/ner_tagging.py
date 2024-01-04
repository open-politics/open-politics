# Notes for Agent Search Chain
# Agentsearch has a big embedding database and relatively sound mechanism to retrieve from the qdrant database.
# The first big advantage is the ready-to-deploy infrastructure (meaning dataset and qrandt docker application)
# The second advantage is the household chain they deliver to return most similar results.
# A question is whether or not to put ad-hoc embeddings into the same shards as the database
# Question: Nr. and Setup of Shards, intermediate step model selection, catalogue 1

from flair.data import Sentence
from flair.models import SequenceTagger

def predict_ner_tags(text):
    # load tagger
    tagger = SequenceTagger.load("flair/ner-english-ontonotes")

    # make example sentence
    sentence = Sentence(text)

    # predict NER tags
    tagger.predict(sentence)

    # print sentence
    print(sentence)

    # print predicted NER spans
    print('The following NER tags are found:')
    # iterate over entities and print
    for entity in sentence.get_spans('ner'):
        print(entity)

