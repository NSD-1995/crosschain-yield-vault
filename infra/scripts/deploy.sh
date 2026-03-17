#!/bin/bash

echo "Starting deployment..."

cd contracts
npm install
npx hardhat compile
npm run deploy:local

cd ../backend
npm install

cd ../frontend
npm install

echo "Deployment completed"