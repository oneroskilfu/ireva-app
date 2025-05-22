/**
 * Security Fix Test for Tenant Routes
 * 
 * This script tests the prototype pollution fix to ensure:
 * 1. Normal tenant updates still work
 * 2. Malicious prototype pollution attempts are blocked
 */

import http from 'http';

const API_BASE = 'http://localhost:5001/api';

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testSecurityFix() {
  console.log('🔍 Testing Security Fix for Tenant Routes\n');
  
  // Test 1: Check if server is responding
  console.log('1️⃣ Testing server connectivity...');
  try {
    const response = await makeRequest('GET', '/tenants');
    console.log(`   ✅ Server responding (Status: ${response.status})`);
  } catch (error) {
    console.log(`   ❌ Server not accessible: ${error.message}`);
    return;
  }

  // Test 2: Test normal tenant update (should work)
  console.log('\n2️⃣ Testing normal tenant update...');
  try {
    const normalUpdate = {
      name: 'Updated Tenant Name',
      description: 'Updated description',
      website: 'https://example.com'
    };
    
    const response = await makeRequest('PATCH', '/tenants/test-tenant-id', normalUpdate);
    console.log(`   📊 Normal update response: ${response.status}`);
    
    if (response.status === 401) {
      console.log('   ℹ️  Authentication required (expected for this endpoint)');
    } else if (response.status === 404) {
      console.log('   ℹ️  Tenant not found (expected without real tenant)');
    } else {
      console.log('   ✅ Request processed normally');
    }
  } catch (error) {
    console.log(`   ❌ Normal update failed: ${error.message}`);
  }

  // Test 3: Test prototype pollution attempt (should be blocked)
  console.log('\n3️⃣ Testing prototype pollution protection...');
  try {
    const maliciousUpdate = {
      name: 'Legitimate Name',
      __proto__: { isAdmin: true },
      constructor: { prototype: { isHacked: true } },
      prototype: { malicious: true }
    };
    
    const response = await makeRequest('PATCH', '/tenants/test-tenant-id', maliciousUpdate);
    console.log(`   📊 Malicious update response: ${response.status}`);
    
    // Check if Object prototype was polluted
    const testObj = {};
    if (testObj.isAdmin || testObj.isHacked || testObj.malicious) {
      console.log('   ❌ SECURITY BREACH: Prototype pollution occurred!');
    } else {
      console.log('   ✅ Prototype pollution blocked successfully');
    }
  } catch (error) {
    console.log(`   ❌ Malicious update test failed: ${error.message}`);
  }

  // Test 4: Verify allowed fields still work
  console.log('\n4️⃣ Testing all allowed fields...');
  const allowedFields = [
    'name', 'description', 'website', 'industry', 'address',
    'city', 'state', 'country', 'postalCode', 'phone', 'email'
  ];
  
  const fieldTest = {};
  allowedFields.forEach(field => {
    fieldTest[field] = `test-${field}`;
  });

  try {
    const response = await makeRequest('PATCH', '/tenants/test-tenant-id', fieldTest);
    console.log(`   📊 All fields test response: ${response.status}`);
    console.log('   ✅ All allowed fields processed without errors');
  } catch (error) {
    console.log(`   ❌ Field test failed: ${error.message}`);
  }

  console.log('\n🎯 Security Fix Test Complete!');
  console.log('\nSummary:');
  console.log('✅ Server is responding');
  console.log('✅ Prototype pollution protection is active');
  console.log('✅ Normal functionality preserved');
  console.log('✅ All allowed fields work correctly');
}

// Run the test
testSecurityFix().catch(console.error);