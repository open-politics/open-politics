#!/bin/bash
git pull

cd backend
docker-compose up -d

cd .. 
cd frontend/next-generation-interface
nvm use --lts
npm run dev -- --host
