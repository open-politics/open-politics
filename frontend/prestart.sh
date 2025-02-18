#!/usr/bin/env bash

# curl http://localhost:8022/api/v1/openapi.json > openapi.json &&

# npx run modify-openapi-operationids.js 

npm run generate-client 

npx biome format --write ./src/client 

echo "prestart.sh has been run successfully. OpenAI client generated."

