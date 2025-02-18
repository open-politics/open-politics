#! /usr/bin/env bash

# Let the DB start
python /app/app/backend_pre_start.py

# # New column: create workspaces table
# alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head

# Create initial data in DB
python /app/app/initial_data.py