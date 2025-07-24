const axios = require('axios');

const apiUrl = 'https://game-39rz.onrender.com/api/auth/admin/login';

// Test cases with different credential combinations
const testCases = [
  { email: 'admin@numbergame.com', password: 'Admin@123', label: 'Default credentials' },
  { email: 'admin@numbergame.com', password: 'admin123', label: 'Lowercase password' },
  { email: 'admin@numbergame.com', password: 'admin@123', label: 'Lowercase @ password' },
  { email: 'Admin@numbergame.com', password: 'Admin@123', label: 'Case-sensitive email' },
  { email: 'admin@numbergame.com', password: 'Password123', label: 'Common password format' },
];

async function testLogin(creds, label) {
  try {
    console.log(`\nTesting: ${label}`);
    console.log(`Email: ${creds.email}`);
    console.log(`Password: ${creds.password}`);
    
    const response = await axios.post(apiUrl, {
      email: creds.email,
      password: creds.password
    });
    
    console.log('\nSUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return { 
      success: true, 
      data: response.data,
      status: response.status
    };
  } catch (err) {
    console.log('\nERROR!');
    console.log('Status:', err.response?.status);
    console.log('Error:', JSON.stringify(err.response?.data || err.message, null, 2));
    
    return { 
      success: false, 
      error: err.response?.data || { message: err.message },
      status: err.response?.status || 500
    };
  }
}

async function runAllTests() {
  console.log('======================================');
  console.log('TESTING ADMIN LOGIN WITH RENDER.COM API');
  console.log('======================================');
  console.log('API URL:', apiUrl);
  console.log('======================================\n');
  
  for (const testCase of testCases) {
    await testLogin(testCase, testCase.label);
    console.log('--------------------------------------');
  }
  
  console.log('\nAll tests completed!');
}

// Run the tests
runAllTests().catch(err => {
  console.error('Test script error:', err);
});
