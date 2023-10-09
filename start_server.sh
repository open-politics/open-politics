#!/bin/bash
gunicorn open_politics_project.wsgi:application --bind 0.0.0.0:4000 --workers 3
