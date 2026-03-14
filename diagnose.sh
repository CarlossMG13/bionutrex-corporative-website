#!/bin/bash

echo "🔧 BioNutrex Diagnostic Script"
echo "================================"
echo ""

# Check if PostgreSQL is running
echo "1️⃣  Checking PostgreSQL connection..."
if nc -z localhost 5432 2>/dev/null; then
  echo "✅ PostgreSQL is running on port 5432"
else
  echo "❌ PostgreSQL is NOT running on port 5432"
  echo "   Start PostgreSQL and try again"
  exit 1
fi

echo ""
echo "2️⃣  Starting backend server..."
cd /home/andres/dev/bionutrex-corporative-website/bionutrex-backend

# Start backend and capture PID
node src/index.js > /tmp/backend-start.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for server to start
sleep 3

echo ""
echo "3️⃣  Testing API health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
if [ ! -z "$HEALTH_RESPONSE" ]; then
  echo "✅ API is responding"
  echo "   Response: $HEALTH_RESPONSE"
else
  echo "❌ API is not responding"
  echo "   Backend logs:"
  cat /tmp/backend-start.log
fi

echo ""
echo "4️⃣  Testing categories endpoint..."
CATEGORIES=$(curl -s http://localhost:3001/api/categories)
if [ ! -z "$CATEGORIES" ]; then
  echo "✅ Categories endpoint responding"
  echo "   Response: $CATEGORIES"
else
  echo "❌ Categories endpoint not responding"
fi

echo ""
echo "5️⃣  Stopping backend..."
kill $BACKEND_PID 2>/dev/null
sleep 1

echo ""
echo "✨ Diagnostic complete!"
