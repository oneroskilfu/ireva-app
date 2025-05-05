/**
 * Advanced URL generation for iREVA Replit application
 * This script handles various Replit URL formats and ensures proper redirection
 * to the main application running on port 5001
 */

function generateMainAppUrl() {
  console.log('Starting URL generation process');
  
  // Get current URL details
  const currentUrl = window.location.href;
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('Current location:', {
    currentUrl, origin, hostname, protocol
  });
  
  let mainAppUrl = '';
  
  // APPROACH 1: Analyze hostname components
  if (!mainAppUrl) {
    try {
      console.log('Trying Method 1: Direct domain analysis');
      
      // Split the hostname to isolate the repl name and domain
      const parts = hostname.split('.');
      
      if (parts.length >= 2) {
        let replName = parts[0];
        
        // Remove any existing port number (e.g., "-3000")
        if (replName.includes('-')) {
          replName = replName.replace(/-\d+$/, '');
        }
        
        // Construct the URL with port 5001
        mainAppUrl = `${protocol}//${replName}-5001.${parts.slice(1).join('.')}`;
        console.log('Generated URL (Method 1):', mainAppUrl);
      }
    } catch (e) {
      console.error('Error in Method 1:', e);
    }
  }
  
  // APPROACH 2: RegExp pattern matching
  if (!mainAppUrl) {
    try {
      console.log('Trying Method 2: RegExp pattern matching');
      
      // Several patterns to try
      const patterns = [
        // Pattern for standard Replit URL with optional port
        /(https?:\/\/)([^.-]+)(?:-\d+)?(\.[^\/]+)/,
        
        // Pattern for any URL, just replacing or adding port 5001
        /(https?:\/\/[^.]+)(?:-\d+)?(\.[^\/]+)/
      ];
      
      for (const pattern of patterns) {
        const match = origin.match(pattern);
        if (match) {
          mainAppUrl = `${match[1]}${match[2]}-5001${match[3]}`;
          console.log('Generated URL (Method 2):', mainAppUrl);
          break;
        }
      }
    } catch (e) {
      console.error('Error in Method 2:', e);
    }
  }
  
  // APPROACH 3: Specific Replit domain handling
  if (!mainAppUrl) {
    try {
      console.log('Trying Method 3: Specific domain handlers');
      
      // Domain-specific handlers
      if (hostname.includes('.replit.app')) {
        const replName = hostname.split('.')[0].replace(/-\d+$/, '');
        mainAppUrl = `${protocol}//${replName}-5001.replit.app`;
        console.log('Generated URL (Method 3 - replit.app):', mainAppUrl);
      } 
      else if (hostname.includes('.repl.co')) {
        const replName = hostname.split('.')[0].replace(/-\d+$/, '');
        mainAppUrl = `${protocol}//${replName}-5001.repl.co`;
        console.log('Generated URL (Method 3 - repl.co):', mainAppUrl);
      }
      else if (hostname.includes('.replit.dev')) {
        const replName = hostname.split('.')[0].replace(/-\d+$/, '');
        mainAppUrl = `${protocol}//${replName}-5001.replit.dev`;
        console.log('Generated URL (Method 3 - replit.dev):', mainAppUrl);
      }
    } catch (e) {
      console.error('Error in Method 3:', e);
    }
  }
  
  // APPROACH 4: Final fallback using URL parsing
  if (!mainAppUrl) {
    console.log('Using Method 4: URL object manipulation');
    try {
      const urlObj = new URL(origin);
      const hostParts = urlObj.hostname.split('.');
      
      // Clean the first part and add -5001
      hostParts[0] = hostParts[0].replace(/-\d+$/, '') + '-5001';
      urlObj.hostname = hostParts.join('.');
      mainAppUrl = urlObj.toString();
      console.log('Generated URL (Method 4):', mainAppUrl);
    } catch (e) {
      console.error('Error in Method 4:', e);
      
      // Ultra-fallback: simple string manipulation
      mainAppUrl = origin.replace(/:\/\/([^.]+)/, '://$1-5001');
      console.log('Generated URL (Ultra-fallback):', mainAppUrl);
    }
  }
  
  // Validate the URL actually changed
  if (mainAppUrl === origin || mainAppUrl === currentUrl) {
    console.warn('Generated URL matches current URL! Forcing -5001 suffix');
    mainAppUrl = origin + '-5001';
  }
  
  return mainAppUrl;
}

// Quick test for URL generation
function testUrlGeneration() {
  const testUrls = [
    'https://my-repl.replit.app',
    'https://my-repl-3000.replit.app',
    'https://my-repl.repl.co',
    'https://something-complex-name-3000.replit.app/some/path',
    'http://localhost:3000'
  ];
  
  console.log('=== URL GENERATION TESTS ===');
  testUrls.forEach(url => {
    // Mock window.location for testing
    const parts = new URL(url);
    const mockLocation = {
      href: url,
      origin: parts.origin,
      hostname: parts.hostname,
      protocol: parts.protocol
    };
    
    // Save real location and replace with mock
    const realLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });
    
    // Test URL generation
    const result = generateMainAppUrl();
    console.log(`Test: ${url} -> ${result}`);
    
    // Restore real location
    Object.defineProperty(window, 'location', {
      value: realLocation,
      writable: true
    });
  });
  console.log('=== END TESTS ===');
}

// Export for use in other scripts
if (typeof module !== 'undefined') {
  module.exports = { generateMainAppUrl, testUrlGeneration };
}