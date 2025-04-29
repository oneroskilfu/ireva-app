#!/bin/bash

# Usage: bash auto-push.sh "Your commit message"
MESSAGE=$1

if [ -z "$MESSAGE" ]; then
  echo "Please provide a commit message: bash auto-push.sh \"Your message here\""
  exit 1
fi

echo "Adding all changes..."
git add .

echo "Committing with message: $MESSAGE"
git commit -m "$MESSAGE"

echo "Pushing to GitHub..."
git push origin main

echo "✅ All done!"