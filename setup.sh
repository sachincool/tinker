#!/bin/bash

echo "🚀 Setting up your optimized blog..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Start development server
echo "🌟 Starting development server..."
echo "Your blog will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server"

npm run dev
