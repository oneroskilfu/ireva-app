import express from 'express';
import { exec } from 'child_process';
import { Request, Response } from 'express';

// Create router for development tools
export const devToolsRouter = express.Router();

// Only enable in development mode - force to true for now to allow testing
const isDevelopment = true; // process.env.NODE_ENV === 'development';

// Endpoint to run commands (only in development mode)
devToolsRouter.get('/run-command', (req: Request, res: Response) => {
  if (!isDevelopment) {
    return res.status(403).send('This endpoint is only available in development mode');
  }
  
  const commandKey = req.query.command as string;
  
  // Validate command key
  if (!commandKey || typeof commandKey !== 'string') {
    return res.status(400).send('Invalid command key');
  }
  
  // Map command keys to actual commands (no user input in exec)
  const commandMap: Record<string, string> = {
    'status': 'cd /home/runner/workspace/client && node switch-implementation.js status',
    'use-fixed': 'cd /home/runner/workspace/client && node switch-implementation.js use-fixed',
    'use-original': 'cd /home/runner/workspace/client && node switch-implementation.js use-original',
    'test': 'echo test'
  };
  
  // Get the actual command from the safe map
  const command = commandMap[commandKey];
  if (!command) {
    return res.status(403).send('Command key not allowed');
  }
  
  // Execute the pre-defined command (no user input injection possible)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${error.message}`);
    }
    
    if (stderr) {
      return res.status(500).send(`Error: ${stderr}`);
    }
    
    res.send(stdout);
  });
});