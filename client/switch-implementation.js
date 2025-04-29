// Simple script to switch between original and fixed implementations
const fs = require('fs');
const path = require('path');

// Determine what action to take
const action = process.argv[2] || 'help'; // Default to help

// Helper functions
function backupFile(filePath) {
  if (!fs.existsSync(`${filePath}.bak`)) {
    console.log(`Backing up ${filePath} to ${filePath}.bak`);
    fs.copyFileSync(filePath, `${filePath}.bak`);
  }
}

function restoreBackup(filePath) {
  if (fs.existsSync(`${filePath}.bak`)) {
    console.log(`Restoring ${filePath} from backup`);
    fs.copyFileSync(`${filePath}.bak`, filePath);
  } else {
    console.error(`No backup found for ${filePath}`);
  }
}

function copyFile(source, destination) {
  console.log(`Copying ${source} to ${destination}`);
  fs.copyFileSync(source, destination);
}

// File paths
const mainPath = path.join(__dirname, 'src/main.tsx');
const appPath = path.join(__dirname, 'src/App.tsx');
const fixedMainPath = path.join(__dirname, 'src/main-fixed.tsx');
const fixedAppPath = path.join(__dirname, 'src/App-fixed.tsx');

// Perform the action
switch (action) {
  case 'use-fixed':
    // Switch to fixed implementation
    backupFile(mainPath);
    backupFile(appPath);
    copyFile(fixedMainPath, mainPath);
    copyFile(fixedAppPath, appPath);
    console.log('Switched to fixed implementation');
    break;
    
  case 'use-original':
    // Switch back to original implementation
    restoreBackup(mainPath);
    restoreBackup(appPath);
    console.log('Restored original implementation');
    break;
    
  case 'status':
    // Check current status by comparing files
    const mainIsOriginal = !fs.existsSync(`${mainPath}.bak`) || 
      fs.readFileSync(mainPath, 'utf8') === fs.readFileSync(`${mainPath}.bak`, 'utf8');
    
    const appIsOriginal = !fs.existsSync(`${appPath}.bak`) || 
      fs.readFileSync(appPath, 'utf8') === fs.readFileSync(`${appPath}.bak`, 'utf8');
    
    if (mainIsOriginal && appIsOriginal) {
      console.log('Currently using original implementation');
    } else {
      console.log('Currently using fixed implementation');
    }
    break;
    
  case 'help':
  default:
    console.log(`
Usage: node switch-implementation.js [action]

Actions:
  use-fixed      Switch to the fixed implementation
  use-original   Restore the original implementation
  status         Check which implementation is currently active
  help           Show this help message
    `);
    break;
}