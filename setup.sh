#!/bin/bash

echo "🧠 Setting up Omniscient Knowledge Base..."
echo ""

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads
echo "✅ Uploads directory created"
echo ""

# Copy env template if .env doesn't exist
if [ ! -f backend/.env ]; then
  echo "📝 Creating .env file from template..."
  cp backend/env.template backend/.env
  echo "✅ .env file created. Please update it with your API keys!"
  echo ""
else
  echo "ℹ️  .env file already exists, skipping..."
  echo ""
fi

echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --prefix backend

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
npm install --prefix frontend

echo ""
echo "📥 Pre-caching AI models (this may take a minute)..."
npm run prepare-models --prefix backend

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. (Optional) Customize backend/.env"
echo "2. Run 'npm run dev' from the project root to start backend and frontend"
echo "3. Visit http://localhost:5173 to use the app"
echo ""

