#!/usr/bin/env node

// Start the full iREVA application with beautiful homepage
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting full iREVA platform...');

// Start the main application
const appProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

appProcess.on('error', (error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});

appProcess.on('close', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down iREVA platform...');
  appProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating iREVA platform...');
  appProcess.kill('SIGTERM');
});