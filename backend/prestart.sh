#! /usr/bin/env bash

# Let the DB start
python /app/app/backend_pre_start.py

# Create initial data in DB
python /app/app/initial_data.py

# alembic revision --autogenerate -m "Add run_id to classification_result"

# # Run migrations
alembic upgrade head