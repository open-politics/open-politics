#!/bin/bash

docker-compose up -d
cd frontend/next-generation-interface
npm run dev -- --host