#!/bin/bash

# Navigate to the project directory (if not already there)
cd /opt/open-politics

# Stop the running containers related to your docker-compose setup
docker-compose down

# Build the Docker image without using cache
docker-compose build --no-cache

# Start the services as defined in docker-compose.yml
docker-compose up -d
