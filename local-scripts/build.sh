#!/bin/bash

# Docker image build and run script for Kiro Stage Editor

# Build Docker image
echo "Building Docker image..."
docker build -t kiro-stage-editor .

# Run Docker container
echo "Running Docker container..."
docker run --name kiro-stage-editor -d -p 8080:8080 kiro-stage-editor

echo "Kiro Stage Editor is now running at http://localhost:8080"