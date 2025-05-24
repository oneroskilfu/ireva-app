#!/bin/bash

# Run the port 3000 test script
echo "Testing port 3000 binding..."
node test-port-3000.cjs

# This should never be reached
echo "Server exited unexpectedly"