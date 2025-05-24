#!/bin/bash

# TCP-Bind Startup Script
# This script runs the tcp-bind.js file which:
# 1. Creates a minimal TCP server that binds to port 5000 immediately
# 2. Spawns the actual application server as a child process
# 3. Hands over the port to the real server after it's ready

echo "Starting TCP-Bind process for quick port binding..."
node tcp-bind.js