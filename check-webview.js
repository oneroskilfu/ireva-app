/**
 * Webview Display Check
 * 
 * This script checks if the application is displaying correctly
 * in the webview by making HTTP requests to both ports.
 */

import http from 'http';

// Helper function to make a GET request to a URL
function makeRequest(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) + '...' // Show first 200 chars
        });
      });
    });
    
    req.on('error', (err) => {
      reject({
        error: err.message,
        port
      });
    });
    
    // Set a timeout to avoid hanging
    req.setTimeout(2000, () => {
      req.destroy();
      reject({
        error: 'Request timed out',
        port
      });
    });
  });
}

// Main function to check both webview and main application
async function checkApplications() {
  console.log('Checking application on webview port (3000)...');
  
  try {
    const webviewResponse = await makeRequest(3000);
    console.log(`✅ Webview server (port 3000) is responding with status: ${webviewResponse.status}`);
    console.log('Preview of response:');
    console.log(webviewResponse.data);
    
    console.log('\nChecking main application on port 5001...');
    
    try {
      const mainAppResponse = await makeRequest(5001);
      console.log(`✅ Main application (port 5001) is responding with status: ${mainAppResponse.status}`);
      console.log('Preview of response:');
      console.log(mainAppResponse.data);
      
      console.log('\n✅ SUMMARY: Both servers are running and responding to requests');
      console.log('The optimized webview server is displaying on port 3000');
      console.log('The main application is working on port 5001');
      
    } catch (mainErr) {
      console.error(`❌ Error accessing main application on port 5001: ${mainErr.error}`);
      console.log('Please check if the main application is running correctly');
    }
    
  } catch (webviewErr) {
    console.error(`❌ Error accessing webview on port 3000: ${webviewErr.error}`);
    console.log('Please check if the optimized webview server is running correctly');
  }
}

// Run the check
checkApplications().catch(err => {
  console.error('Unexpected error:', err);
});