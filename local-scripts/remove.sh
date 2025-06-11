#!/bin/bash

# Docker container and image removal script for Kiro Stage Editor

echo "Stopping and removing Docker container..."
docker stop kiro-stage-editor && docker rm kiro-stage-editor

echo "Removing Docker image..."
docker rmi kiro-stage-editor

echo "Cleanup completed."