import fetch from 'node-fetch';

// Login test function
async function testLogin() {
  console.log('Testing login functionality...');
  
  try {
    // Test login with admin credentials
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      })
    });
    
    const loginData = await loginResponse.json();
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response cookies:', loginResponse.headers.get('set-cookie'));
    console.log('Login response data:', JSON.stringify(loginData, null, 2));
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      
      // The response should include user data
      if (loginData && loginData.id) {
        console.log('✅ User data received');
        console.log(`User ID: ${loginData.id}`);
        console.log(`Username: ${loginData.username}`);
        console.log(`isAdmin: ${loginData.isAdmin}`);
      } else {
        console.log('❌ Missing user data in response');
      }
    } else {
      console.log('❌ Login failed');
      console.log('Error:', loginData);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testLogin();