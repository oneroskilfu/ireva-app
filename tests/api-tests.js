// API Testing Script for iREVA Platform
const axios = require('axios');
const chalk = require('chalk');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// Test user credentials
const TEST_USER = {
  username: 'testuser',
  password: 'Test@123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '08012345678'
};

// Admin credentials
const ADMIN_USER = {
  username: 'admin',
  password: 'Admin@123'
};

// Helper functions
const log = {
  info: (msg) => console.log(chalk.blue(`[INFO] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[SUCCESS] ${msg}`)),
  error: (msg) => console.log(chalk.red(`[ERROR] ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`[WARNING] ${msg}`))
};

// Setup axios instance with auth header
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  validateStatus: (status) => status < 500 // Don't throw for 4xx errors
});

// Add auth token to requests when available
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return config;
});

// Test registration
async function testRegistration() {
  try {
    log.info('Testing user registration...');
    const response = await api.post('/register', TEST_USER);
    
    if (response.status === 201) {
      log.success('Registration successful');
      return response.data;
    } else if (response.status === 400 && response.data.message.includes('exists')) {
      log.warning('User already exists, proceeding with login');
      return null;
    } else {
      log.error(`Registration failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`Registration error: ${error.message}`);
    return null;
  }
}

// Test login
async function testLogin(credentials) {
  try {
    log.info(`Testing login for ${credentials.username}...`);
    const response = await api.post('/login', {
      username: credentials.username,
      password: credentials.password
    });
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      log.success('Login successful');
      return response.data;
    } else {
      log.error(`Login failed: ${response.data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    return null;
  }
}

// Test user profile fetch
async function testGetUserProfile() {
  try {
    log.info('Testing user profile fetch...');
    const response = await api.get('/user');
    
    if (response.status === 200) {
      log.success('Profile fetch successful');
      return response.data;
    } else {
      log.error(`Profile fetch failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`Profile fetch error: ${error.message}`);
    return null;
  }
}

// Test properties fetch
async function testGetProperties() {
  try {
    log.info('Testing properties fetch...');
    const response = await api.get('/properties');
    
    if (response.status === 200) {
      log.success(`Properties fetch successful. Found ${response.data.length} properties.`);
      return response.data;
    } else {
      log.error(`Properties fetch failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`Properties fetch error: ${error.message}`);
    return null;
  }
}

// Test investments fetch
async function testGetInvestments() {
  try {
    log.info('Testing investments fetch...');
    const response = await api.get('/investments');
    
    if (response.status === 200) {
      log.success(`Investments fetch successful. Found ${response.data.length} investments.`);
      return response.data;
    } else {
      log.error(`Investments fetch failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`Investments fetch error: ${error.message}`);
    return null;
  }
}

// Test notifications fetch
async function testGetNotifications() {
  try {
    log.info('Testing notifications fetch...');
    const response = await api.get('/notifications');
    
    if (response.status === 200) {
      log.success(`Notifications fetch successful. Found ${response.data.length} notifications.`);
      return response.data;
    } else {
      log.error(`Notifications fetch failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`Notifications fetch error: ${error.message}`);
    return null;
  }
}

// Test issue creation
async function testCreateIssue() {
  try {
    log.info('Testing issue creation...');
    const issueData = {
      title: 'Test Issue',
      description: 'This is a test issue created via API tests.',
      category: 'bug',
      priority: 'medium'
    };
    
    const response = await api.post('/issues', issueData);
    
    if (response.status === 201) {
      log.success('Issue creation successful');
      return response.data.issue;
    } else {
      log.error(`Issue creation failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`Issue creation error: ${error.message}`);
    return null;
  }
}

// Test issue fetch
async function testGetIssues() {
  try {
    log.info('Testing issues fetch...');
    const response = await api.get('/issues');
    
    if (response.status === 200) {
      log.success(`Issues fetch successful. Found ${response.data.length} issues.`);
      return response.data;
    } else {
      log.error(`Issues fetch failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`Issues fetch error: ${error.message}`);
    return null;
  }
}

// Test user settings fetch
async function testGetUserSettings() {
  try {
    log.info('Testing user settings fetch...');
    const response = await api.get('/user/settings');
    
    if (response.status === 200) {
      log.success('User settings fetch successful');
      return response.data;
    } else {
      log.error(`User settings fetch failed: ${response.data.message}`);
      return null;
    }
  } catch (error) {
    log.error(`User settings fetch error: ${error.message}`);
    return null;
  }
}

// Main test execution function
async function runTests() {
  log.info('Starting API tests for iREVA Platform');
  
  // Test regular user flow
  await testRegistration();
  const loginResult = await testLogin(TEST_USER);
  
  if (loginResult) {
    await testGetUserProfile();
    await testGetProperties();
    await testGetInvestments();
    await testGetNotifications();
    await testCreateIssue();
    await testGetIssues();
    await testGetUserSettings();
  }
  
  // Reset auth token
  authToken = null;
  
  // Test admin flow
  const adminLoginResult = await testLogin(ADMIN_USER);
  
  if (adminLoginResult) {
    log.info('Running admin-specific tests...');
    // Add admin-specific tests here
  }
  
  log.info('API tests completed');
}

// Run the tests
runTests().catch(err => {
  log.error(`Unhandled error in test execution: ${err.message}`);
});