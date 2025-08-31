#!/bin/bash
# Build script for Netlify deployment

# Build the frontend
echo "Building frontend..."
npm run build

# The Netlify functions are in TypeScript and will be compiled by Netlify's build system
echo "Netlify functions ready (will be compiled by Netlify)"

echo "Build complete!"