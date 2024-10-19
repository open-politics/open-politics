#! /usr/bin/env bash

# Let the DB start
python /app/app/backend_pre_start.py

# Run migrations
alembic upgrade head

pytest /app/tests/search/test_search_and_geojson.py

# Create initial data in DB
python /app/app/initial_data.py
