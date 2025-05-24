#!/bin/bash

# CJS Instant HTTP Startup Script
# This script runs the instant-http.cjs file which:
# 1. Creates a minimal HTTP server that binds to port 5000 immediately
# 2. Serves a simple loading page while the application starts
# 3. Spawns the actual application server as a child process

echo "Starting with CJS Instant HTTP bootstrap..."
node instant-http.cjs