/**
 * Advanced URL generation for iREVA Replit application
 * This script handles various Replit URL formats and ensures proper redirection
 * to the main application running on port 5001
 */

// Generate the main application URL based on current environment
function generateMainAppUrl() {
  // Try to detect Replit environment variables
  const replitId = process.env.REPL_ID || '';
  const replitSlug = process.env.REPL_SLUG || '';
  
  // Get hostname if we're running in a browser
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Case 1: Running in browser
  if (hostname) {
    // Replace existing port number or insert port 5001
    return hostname.replace(/-?\d*\./, '-5001.');
  }
  
  // Case 2: Running on Replit with environment variables
  if (replitId && replitSlug) {
    return `${replitSlug}-5001.${replitId}.repl.co`;
  }
  
  // Fallback: localhost
  return 'localhost:5001';
}

// Test the URL generation
function testUrlGeneration() {
  const mainAppUrl = generateMainAppUrl();
  console.log('Main application URL:', `https://${mainAppUrl}`);
  console.log('Access your application at this URL to see the full functionality');
  
  // Also print information about the webview
  console.log('\nWebview URL:', `https://${mainAppUrl.replace('-5001', '')}`);
  console.log('This is the entry point displayed in Replit\'s webview');
  
  console.log('\nBoth servers should be running for the application to work correctly');
}

// Execute the test
testUrlGeneration();