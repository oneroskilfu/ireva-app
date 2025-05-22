/**
 * Webview Port Check Script
 * 
 * This script is designed to help troubleshoot Replit webview port binding issues.
 * It checks if various ports are accessible and which one should be used.
 */

// The most likely ports to work in Replit
const possiblePorts = [3000, 3001, 3003, 5000, 5001];

// Get the Replit ID from the current URL
function getReplitInfo() {
  try {
    const url = new URL(window.location.href);
    const hostParts = url.hostname.split('.');
    const replId = hostParts[0].split('-')[0]; // Extract just the repl ID part
    
    return {
      replId,
      domain: hostParts.slice(1).join('.'),
      isReplit: hostParts.length > 1 && hostParts.includes('replit')
    };
  } catch (error) {
    console.error('Failed to parse URL:', error);
    return { isReplit: false };
  }
}

// Generate a URL for a specific port in Replit format
function generateReplitUrl(replId, port, domain = 'replit.dev') {
  return `https://${replId}-${port}.${domain}/`;
}

// Check if a URL is accessible
async function checkUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set a timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, timeout);
    
    // Try to fetch the URL
    fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors',
      signal
    })
    .then(response => {
      clearTimeout(timeoutId);
      resolve(true);
    })
    .catch(error => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
}

// Check all possible ports and return the first working one
async function findWorkingPort(replId, domain) {
  for (const port of possiblePorts) {
    const url = generateReplitUrl(replId, port, domain);
    console.log(`Checking port ${port} at ${url}...`);
    
    const isWorking = await checkUrl(url);
    if (isWorking) {
      console.log(`Found working port: ${port}`);
      return port;
    }
  }
  console.log('No working ports found');
  return null;
}

// Main function to run the check
async function runPortCheck() {
  const statusElement = document.getElementById('status');
  const directionsElement = document.getElementById('directions');
  
  if (!statusElement || !directionsElement) {
    console.error('Required elements not found on page');
    return;
  }
  
  statusElement.textContent = 'Checking for available ports...';
  
  const replInfo = getReplitInfo();
  console.log('Repl info:', replInfo);
  
  if (!replInfo.isReplit) {
    statusElement.textContent = 'Not running on Replit. Port check only works on Replit.';
    return;
  }
  
  const workingPort = await findWorkingPort(replInfo.replId, replInfo.domain);
  
  if (workingPort) {
    const url = generateReplitUrl(replInfo.replId, workingPort, replInfo.domain);
    statusElement.textContent = `Found working port: ${workingPort}`;
    
    // Safe DOM manipulation to prevent XSS
    directionsElement.innerHTML = '';
    const p1 = document.createElement('p');
    p1.textContent = 'The application is available at:';
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.className = 'link';
    link.textContent = url;
    const p2 = document.createElement('p');
    p2.textContent = 'Click the link above to open the application.';
    
    directionsElement.appendChild(p1);
    directionsElement.appendChild(link);
    directionsElement.appendChild(p2);
  } else {
    statusElement.textContent = 'No working ports found. The application may not be running.';
    directionsElement.innerHTML = '';
    const p1 = document.createElement('p');
    p1.textContent = 'Please make sure the application is running by checking the workflow status.';
    const p2 = document.createElement('p');
    p2.textContent = 'If the application is running but not accessible, try restarting the workflow.';
    
    directionsElement.appendChild(p1);
    directionsElement.appendChild(p2);
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.webviewPortCheck = {
    getReplitInfo,
    generateReplitUrl,
    checkUrl,
    findWorkingPort,
    runPortCheck
  };
}