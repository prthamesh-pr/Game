const axios = require('axios');

// Configurable URLs
const BASE_URL = process.env.API_URL || 'https://game-39rz.onrender.com';
const API_URL = `${BASE_URL}/api`;

// Test a single endpoint
async function testEndpoint(method, url, data = null, token = null, description = '') {
  console.log(`\n🔍 Testing ${description || url}...`);
  
  try {
    const config = {
      method,
      url: url.startsWith('http') ? url : `${API_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put')) {
      config.data = data;
    }

    const response = await axios(config);
    
    console.log(`✅ SUCCESS - Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    
    return {
      success: true,
      status: response.status,
      data: response.data
    };
    
  } catch (error) {
    console.log(`❌ ERROR - Status: ${error.response?.status || 'No response'}`);
    
    if (error.response?.data) {
      console.log(`   Message: ${error.response.data.message || 'Unknown error'}`);
      
      if (error.response.status === 404 && error.response.data.availableRoutes) {
        console.log(`   Available routes: ${error.response.data.availableRoutes.join(', ')}`);
      }
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || { message: error.message }
    };
  }
}

// Run the tests
async function runTests() {
  console.log('🔍 QUICK API ENDPOINT TEST');
  console.log('================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);
  console.log('');

  // Test the key endpoints
  await testEndpoint('GET', `${BASE_URL}/health`, null, null, 'Server Health Check');
  await testEndpoint('GET', '/api/health', null, null, 'API Health Check');
  await testEndpoint('GET', '/api', null, null, 'API Root Endpoint');
  await testEndpoint('GET', '/api/auth', null, null, 'Auth Base Route');
  await testEndpoint('GET', '/api/game/current', null, null, 'Current Game');
  await testEndpoint('GET', '/api/game/rounds', null, null, 'Game Rounds');
  
  console.log('\n✅ Quick API test completed');
}

// Execute the tests
runTests().catch(console.error);
