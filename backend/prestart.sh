#! /usr/bin/env bash

# Let the DB start
python /app/app/backend_pre_start.py

# Run migrations
# alembic upgrade head

# New column: create workspaces table
# alembic revision --autogenerate -m "Add classification_schemes table"
# alembic upgrade head

# Create initial data in DB
python /app/app/initial_data.py

# Generate client
python -c "
import app.main; 
import json; 

with open('/app/openapi.json', 'w') as f:
    json.dump(app.main.app.openapi(), f)
print('openapi.json has been written successfully')
"

