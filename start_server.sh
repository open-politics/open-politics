#!/bin/bash
git pull

python manage.py makemigrations news

python manage.py runserver