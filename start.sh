#!/bin/bash
cd backend
docker compose down
docker compose up --build -d

cd ..
cd frontend


# Ensure NVM is loaded
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"

# Use LTS version of Node
nvm use --lts

npm install
npm run dev
