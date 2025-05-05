# iREVA Platform Quick Start Guide

This guide provides a quick overview of how to get started with the iREVA platform development environment.

## Prerequisites

- Node.js v20+ and NPM v10+
- Git for version control
- A code editor (VS Code recommended)
- PostgreSQL database (local or remote)

## Setup Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ireva-platform

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set DATABASE_URL to your PostgreSQL connection string
```

### 3. Database Setup

```bash
# Push schema changes to the database
npm run db:push
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev
```

This will start the development server on port 5001.

### 5. Replit-Specific Commands

If you're developing on Replit:

```bash
# Start the application with Replit-specific configurations
./workflow-command.sh
```

## Project Structure

- `client/` - Frontend React application
- `server/` - Backend Express API
- `shared/` - Shared code and types
- `dist/` - Production build output

## Key Development Workflows

### Frontend Development

1. Frontend code is in `client/src/`
2. Use `wouter` for routing
3. Use `shadcn` components for UI
4. Use `@tanstack/react-query` for data fetching

### Backend Development

1. Backend code is in `server/`
2. API routes are defined in `server/routes.ts`
3. Database models are in `shared/schema.ts`
4. Storage interface is in `server/storage.ts`

### Database Changes

1. Update models in `shared/schema.ts`
2. Run `npm run db:push` to apply changes

## Testing and Building

### Testing

```bash
# Run tests
npm test
```

### Production Build

```bash
# Create a production build
./workflow-production-build.sh

# Start the production server
./workflow-production-start.sh
```

## Troubleshooting

### Port Binding Issues

If you encounter "Port already in use" errors:

```bash
# Find processes using the ports
lsof -i :3000
lsof -i :5001

# Kill the processes
kill -9 <PID>
```

### Database Connection Issues

Verify your database connection:

```bash
# Check if the database is accessible
node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT NOW()', (err, res) => console.log(err || res.rows[0]))"
```

## Additional Resources

- [DUAL-PORT-SOLUTION.md](./DUAL-PORT-SOLUTION.md) - Explanation of the port architecture
- [PRODUCTION-DEPLOYMENT-GUIDE.md](./PRODUCTION-DEPLOYMENT-GUIDE.md) - Production deployment instructions
- [PORT-CONFIGURATION.md](./PORT-CONFIGURATION.md) - Port setup and configuration details

## Support

For additional help, contact the iREVA development team.