# iREVA Platform Quick-Start Guide

This guide provides essential information for quickly getting started with the iREVA platform development, including important notes about the Replit deployment environment.

## 1. Initial Setup

### Clone and Install
```bash
git clone https://github.com/ireva-investments/core-platform.git
cd core-platform
npm install
```

### Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup
```bash
npm run db:push
```

## 2. Development

### Local Development
For local development outside of Replit:
```bash
npm run dev
```

### Replit Development
When developing on Replit:
1. Use the workflow system rather than running commands directly
2. The workflow is configured to use `./workflow-command.sh`
3. This ensures proper port binding detection

## 3. Port Binding Strategy

### Important: Replit-Specific Port Configuration

The iREVA platform uses a special port binding strategy for Replit deployment:

1. A minimal TCP server binds immediately to port 5000 (required for Replit workflow detection)
2. The main application detects this and automatically uses port 5001
3. This approach resolves Replit's "didn't open port after 20000ms" workflow error

### Access URLs
- Main application: `https://repl-user-port-5001.yourrepl.repl.co/` 
- Investor dashboard: `https://repl-user-port-5001.yourrepl.repl.co/investor/dashboard`
- Admin dashboard: `https://repl-user-port-5001.yourrepl.repl.co/admin/dashboard`

### Port Configuration
Port settings are centralized in `server/config/ports.js` for easy maintenance.

## 4. Authentication

The application uses JWT-based authentication with role-based access control:
- Investor routes: `/investor/*`
- Admin routes: `/admin/*`

## 5. Key Documentation Files

- `README.md`: Main project documentation
- `WORKFLOW_UPDATE_GUIDE.md`: Comprehensive guide to Replit workflow configuration
- `README-NEXT-STEPS.md`: Concise steps for workflow setup
- `server/config/ports.js`: Central port configuration

## 6. Troubleshooting

### Workflow Detection Issues
If Replit fails to detect the port binding:
1. Verify the workflow command is set to `./workflow-command.sh`
2. Check workflow logs for binding confirmation messages
3. If issues persist, try alternative scripts in `README-NEXT-STEPS.md`

### Port Conflicts
If you see port conflict errors in logs:
1. The main app should automatically switch to port 5001
2. If not, check `server/config/ports.js` settings
3. You can modify port numbers in this file if needed

## 7. Contact

For additional help or questions:
- Development team: dev@ireva.io
- Documentation: docs@ireva.io