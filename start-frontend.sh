#!/bin/bash

echo "Starting the frontend server..."

# Change to the frontend directory
cd frontend

# Check if package.json exists
if [ -f package.json ]; then
  # Check if the start script exists in package.json
  if grep -q "\"start\"" package.json; then
    echo "Running npm start..."
    npm start
  else
    echo "Warning: start script not found in package.json"
    echo "You may need to add it to your package.json scripts section:"
    echo "  \"scripts\": {"
    echo "    \"start\": \"react-scripts start\""
    echo "  }"
  fi
else
  echo "Error: package.json not found in frontend directory"
  echo "Make sure you're in the correct project directory"
  exit 1
fi 