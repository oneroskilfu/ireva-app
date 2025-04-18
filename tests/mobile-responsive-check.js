// Mobile Responsiveness Test Script for iREVA Platform
// This script uses Puppeteer to check mobile responsiveness of key pages

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const DEFAULT_TIMEOUT = 15000;

// Device viewport presets
const DEVICES = {
  mobile: { width: 375, height: 667, name: 'mobile' }, // iPhone 8
  tablet: { width: 768, height: 1024, name: 'tablet' }, // iPad
  desktop: { width: 1366, height: 768, name: 'desktop' } // Laptop
};

// Pages to test
const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/auth', name: 'Auth' },
  { path: '/issues', name: 'Issues', authenticated: true },
  { path: '/account/settings', name: 'Settings', authenticated: true },
  { path: '/investor/dashboard', name: 'InvestorDashboard', authenticated: true },
  { path: '/investor/portfolio', name: 'Portfolio', authenticated: true },
  { path: '/investor/wallet', name: 'Wallet', authenticated: true },
  { path: '/admin/engagement-metrics', name: 'Metrics', authenticated: true, adminOnly: true }
];

// Helper logging functions
const log = {
  info: (msg) => console.log(chalk.blue(`[INFO] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[SUCCESS] ${msg}`)),
  error: (msg) => console.log(chalk.red(`[ERROR] ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`[WARNING] ${msg}`))
};

// Authentication credentials
const CREDENTIALS = {
  user: { username: 'testuser', password: 'Test@123' },
  admin: { username: 'admin', password: 'Admin@123' }
};

// Ensure screenshots directory exists
async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    log.info(`Screenshots will be saved to ${SCREENSHOTS_DIR}`);
  } catch (error) {
    log.error(`Failed to create screenshots directory: ${error.message}`);
    throw error;
  }
}

// Take screenshot of a page at different device sizes
async function takeScreenshotsForPage(page, pagePath, pageName, authenticated = false) {
  const filename = pageName.toLowerCase().replace(/\s+/g, '-');
  
  for (const [deviceKey, device] of Object.entries(DEVICES)) {
    log.info(`Testing ${pageName} on ${deviceKey}...`);
    
    // Set viewport to match device
    await page.setViewport({ width: device.width, height: device.height });
    
    // Navigate to page
    try {
      await page.goto(`${BASE_URL}${pagePath}`, { timeout: DEFAULT_TIMEOUT, waitUntil: 'networkidle2' });
      log.success(`Loaded ${pageName} on ${deviceKey}`);
    } catch (error) {
      log.error(`Failed to load ${pageName} on ${deviceKey}: ${error.message}`);
      continue;
    }
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${filename}-${device.name}.png`);
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log.success(`Saved screenshot to ${screenshotPath}`);
    } catch (error) {
      log.error(`Failed to take screenshot: ${error.message}`);
    }
    
    // Check for common mobile responsiveness issues
    const responsiveIssues = await checkResponsiveIssues(page);
    if (responsiveIssues.length > 0) {
      log.warning(`Found ${responsiveIssues.length} responsive issues on ${pageName} (${deviceKey}):`);
      responsiveIssues.forEach((issue, i) => {
        log.warning(`  ${i + 1}. ${issue}`);
      });
    } else {
      log.success(`No responsive issues found on ${pageName} (${deviceKey})`);
    }
  }
}

// Check for common responsive design issues
async function checkResponsiveIssues(page) {
  const issues = [];
  
  // Check for horizontal overflow
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  
  if (hasHorizontalOverflow) {
    issues.push('Horizontal scrollbar detected (page content overflows horizontally)');
  }
  
  // Check for elements that extend beyond viewport
  const overflowingElements = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const viewportWidth = window.innerWidth;
    
    return allElements
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.left < 0 || rect.right > viewportWidth;
      })
      .map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        width: el.getBoundingClientRect().width
      }))
      .slice(0, 5); // Limit to first 5 elements to avoid too much output
  });
  
  if (overflowingElements.length > 0) {
    overflowingElements.forEach(el => {
      issues.push(`Element ${el.tagName}${el.id ? '#' + el.id : ''} extends beyond viewport (width: ${el.width}px)`);
    });
  }
  
  // Check for tiny text (less than 12px)
  const tinyTextElements = await page.evaluate(() => {
    const textElements = Array.from(document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button, a, label, input'));
    
    return textElements
      .filter(el => {
        const fontSize = parseInt(window.getComputedStyle(el).fontSize);
        return fontSize < 12 && el.textContent.trim().length > 0;
      })
      .map(el => ({
        tagName: el.tagName,
        text: el.textContent.substring(0, 20) + (el.textContent.length > 20 ? '...' : ''),
        fontSize: window.getComputedStyle(el).fontSize
      }))
      .slice(0, 5); // Limit to first 5 elements
  });
  
  if (tinyTextElements.length > 0) {
    tinyTextElements.forEach(el => {
      issues.push(`Small text detected: ${el.tagName} "${el.text}" (${el.fontSize})`);
    });
  }
  
  // Check for touch targets that are too small (less than 44x44 pixels)
  const smallTouchTargets = await page.evaluate(() => {
    const interactiveElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
    
    return interactiveElements
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return (rect.width < 44 || rect.height < 44) && el.clientWidth > 0 && el.clientHeight > 0;
      })
      .map(el => ({
        tagName: el.tagName,
        id: el.id,
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height)
      }))
      .slice(0, 5); // Limit to first 5 elements
  });
  
  if (smallTouchTargets.length > 0) {
    smallTouchTargets.forEach(el => {
      issues.push(`Small touch target: ${el.tagName}${el.id ? '#' + el.id : ''} (${el.width}x${el.height}px)`);
    });
  }
  
  return issues;
}

// Login to the application
async function login(page, isAdmin = false) {
  try {
    const credentials = isAdmin ? CREDENTIALS.admin : CREDENTIALS.user;
    log.info(`Logging in as ${isAdmin ? 'admin' : 'user'}...`);
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/auth`, { timeout: DEFAULT_TIMEOUT, waitUntil: 'networkidle2' });
    
    // Fill in login form
    await page.type('input[name="username"]', credentials.username);
    await page.type('input[name="password"]', credentials.password);
    
    // Click login button
    await Promise.all([
      page.waitForNavigation({ timeout: DEFAULT_TIMEOUT }),
      page.click('button[type="submit"]')
    ]);
    
    // Check if login was successful
    const url = page.url();
    if (!url.includes('/auth')) {
      log.success(`Successfully logged in as ${isAdmin ? 'admin' : 'user'}`);
      return true;
    } else {
      log.error(`Failed to login as ${isAdmin ? 'admin' : 'user'}`);
      return false;
    }
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  await ensureScreenshotsDir();
  
  // Launch browser
  log.info('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Test public pages first
    const publicPages = PAGES_TO_TEST.filter(p => !p.authenticated);
    log.info(`Testing ${publicPages.length} public pages...`);
    
    for (const pageInfo of publicPages) {
      await takeScreenshotsForPage(page, pageInfo.path, pageInfo.name);
    }
    
    // Login as regular user and test user pages
    const userLoggedIn = await login(page);
    
    if (userLoggedIn) {
      const userPages = PAGES_TO_TEST.filter(p => p.authenticated && !p.adminOnly);
      log.info(`Testing ${userPages.length} user pages...`);
      
      for (const pageInfo of userPages) {
        await takeScreenshotsForPage(page, pageInfo.path, pageInfo.name, true);
      }
    }
    
    // Login as admin and test admin pages
    const adminLoggedIn = await login(page, true);
    
    if (adminLoggedIn) {
      const adminPages = PAGES_TO_TEST.filter(p => p.authenticated && p.adminOnly);
      log.info(`Testing ${adminPages.length} admin pages...`);
      
      for (const pageInfo of adminPages) {
        await takeScreenshotsForPage(page, pageInfo.path, pageInfo.name, true);
      }
    }
    
    log.success('Mobile responsiveness tests completed');
  } catch (error) {
    log.error(`Test execution error: ${error.message}`);
    console.error(error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the tests
runTests().catch(err => {
  log.error(`Unhandled error in test execution: ${err.message}`);
});