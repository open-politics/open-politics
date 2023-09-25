#!/bin/bash

# Navigate to the directory where docker-compose.yml is present (assuming top folder)
cd "$(dirname "$0")"

# Check if Docker containers are already running
if [ "$(docker-compose ps -q)" ]; then
    echo "Stopping existing Docker containers..."
    docker-compose down
fi

# Start the Django server
echo "Starting the Django server..."
docker-compose up --build

