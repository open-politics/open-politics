#!/bin/bash

# Personal Server Restart Script

cd /opt/open-politics

docker-compose down

docker-compose build --no-cache

docker-compose up -d

docker-compose ps
