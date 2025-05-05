# iREVA Platform Production Deployment Guide

This document provides instructions for building and deploying the iREVA platform in a production environment.

## Build Process Overview

The build process for iREVA involves two main steps:
1. Building the React frontend with Vite
2. Building the Node.js/Express backend with esbuild

## Prerequisites

- Node.js v20+ installed
- NPM v10+ installed
- PostgreSQL database configured (connection string in .env file)
- All necessary API keys and secrets configured in .env file

## Production Build Instructions

### Method 1: Using the Master Build Script

The simplest way to create a production build is to use the master build script:

```bash
# Make the script executable (if needed)
chmod +x build-master.sh

# Run the master build script
./build-master.sh
```

This script will:
- Clean up any existing build files
- Build the frontend with Vite
- Build the backend with esbuild
- Copy necessary assets and environment files
- Generate a VERSION.txt file with build details

### Method 2: Step-by-Step Build

If you prefer to build the application in stages, you can use the individual build scripts:

#### 1. Build the Frontend

```bash
./build-frontend.sh
```

This builds just the React frontend with Vite, placing the output in `dist/public`.

#### 2. Build the Backend

```bash
./build-backend.sh
```

This builds the Node.js/Express backend with esbuild, placing the output in `dist`.

### Running in Production

Once the build process is complete, you can start the application in production mode:

```bash
./start-production.sh
```

The application will run on port 5001 by default.

## Production Environment Configuration

For a production deployment, ensure you have the following environment variables set:

- `NODE_ENV=production`
- `DATABASE_URL` - Your PostgreSQL connection string
- Any API keys needed by the application

You can set these either in a `.env` file in the root directory (which will be copied to the `dist` folder during the build) or set them in your deployment environment.

## Deployment Options

### Option 1: Replit Deployment

The easiest way to deploy is using Replit's built-in deployment feature:

1. Complete the production build using the instructions above
2. Click the "Deploy" button in the Replit UI
3. Follow the prompts to deploy the application

### Option 2: Manual Deployment

For deploying to other platforms:

1. Complete the production build
2. Copy the entire `dist` directory to your production server
3. Install production dependencies: `cd dist && npm install --production`
4. Start the server: `NODE_ENV=production node index.js`

## Dual-Port Architecture

Note that the iREVA platform uses a dual-port architecture:

- Port 3000: Static webview server for Replit environment
- Port 5001: Main application server

In a production environment, you may want to use a reverse proxy (like Nginx) to route traffic appropriately.

## Troubleshooting

If you encounter issues during the build or deployment:

1. Check the build logs for specific error messages
2. Ensure all dependencies are installed: `npm install`
3. Verify database connectivity with `node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT NOW()', (err, res) => console.log(err || res.rows[0]))"`
4. Make sure all required environment variables are set

## Support

For additional help or to report issues, please contact the iREVA support team.