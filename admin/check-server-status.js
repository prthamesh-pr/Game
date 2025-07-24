const axios = require('axios');

const baseUrl = 'https://game-39rz.onrender.com/api';
const localBaseUrl = 'http://localhost:5000/api';

async function checkServerStatus(url) {
  try {
    console.log(`Checking server status at ${url}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await axios.get(`${url}/health-check`, {
      signal: controller.signal,
      timeout: 10000
    });
    
    clearTimeout(timeoutId);
    console.log('Server is up and running!');
    console.log('Response:', response.data);
    return true;
  } catch (err) {
    console.log(`Error checking server status at ${url}:`);
    
    if (err.code === 'ERR_CANCELED' || err.code === 'ECONNABORTED') {
      console.log('Connection timed out after 10 seconds');
      return false;
    }
    
    if (err.code === 'ERR_CONNECTION_REFUSED' || err.code === 'ECONNREFUSED') {
      console.log('Connection refused - server is not running or not accessible');
      return false;
    }
    
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', err.response.data);
      // A 404 on health-check endpoint but with response means server is running
      return err.response.status !== 500;
    }
    
    console.log('Error:', err.message);
    return false;
  }
}

async function checkApiEndpoints(apiBaseUrl) {
  let availableRoutes = [];
  
  // First try to get available routes
  try {
    console.log('\nFetching available API routes...');
    // Use a non-existent endpoint to get available routes from error response
    const response = await axios.get(`${apiBaseUrl}/routes-info`, { timeout: 5000 });
    console.log('Unexpected success?', response.data);
  } catch (err) {
    if (err.response?.data?.availableRoutes) {
      availableRoutes = err.response.data.availableRoutes.map(route => route.replace(/^\/api/, '')); // Remove /api prefix if present
      console.log('Available routes:', availableRoutes);
    } else if (err.code === 'ERR_CONNECTION_REFUSED' || err.code === 'ECONNREFUSED') {
      console.log('Connection refused when fetching routes - server not responding');
      return false;
    } else {
      console.log('Error fetching routes:', err.message);
      return false;
    }
  }
  
  // Add specific endpoints to check
  const endpoints = [
    { url: '/auth/admin/login', method: 'get', authRequired: false }, // Don't actually login, just check endpoint
    { url: '/user', method: 'options', authRequired: true },
    { url: '/admin/dashboard', method: 'options', authRequired: true }
  ];
  
  console.log('\nChecking API endpoints availability...');
  
  // Check auth endpoint directly with GET (no auth required)
  try {
    console.log('\nTesting auth endpoint (no credentials)...');
    await axios.get(`${apiBaseUrl}/auth/admin/login`, { timeout: 5000 });
    console.log('ERROR: Endpoint should not allow GET without credentials');
  } catch (err) {
    if (err.response?.status === 404) {
      console.log('Endpoint not found');
    } else if (err.response?.status === 401 || err.response?.status === 400) {
      console.log('✓ Auth endpoint working correctly - requires authentication');
    } else if (err.code === 'ERR_CONNECTION_REFUSED' || err.code === 'ECONNREFUSED') {
      console.log('✖ Connection refused - server not responding');
      return false;
    } else {
      console.log('Response status:', err.response?.status);
      console.log('Response message:', err.response?.data?.message || 'No message');
    }
  }
  
  return true;
}

async function pingServerDirectly() {
  try {
    console.log('\nPinging the render.com server directly...');
    // Extracting just the hostname part
    const hostname = new URL('https://game-39rz.onrender.com').hostname;
    
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec(`ping ${hostname} -n 3`, (error, stdout, stderr) => {
        console.log('Ping results:');
        console.log(stdout);
        
        // Check if ping was successful
        const success = !error && stdout.includes('Reply from') && !stdout.includes('Request timed out');
        resolve(success);
      });
    });
  } catch (error) {
    console.log('Error pinging server:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('======================================');
  console.log('CHECKING API SERVER STATUS');
  console.log('======================================');
  console.log('Remote URL:', baseUrl);
  console.log('Local URL:', localBaseUrl);
  console.log('======================================\n');
  
  console.log('REMOTE SERVER CHECK:');
  console.log('---------------------');
  const remoteServerRunning = await checkServerStatus(baseUrl);
  
  if (!remoteServerRunning) {
    // Try pinging directly to check if server is reachable
    const pingSuccessful = await pingServerDirectly();
    console.log('\nServer ping successful:', pingSuccessful ? 'YES' : 'NO');
  }
  
  console.log('\nLOCAL SERVER CHECK:');
  console.log('---------------------');
  const localServerRunning = await checkServerStatus(localBaseUrl);
  
  if (remoteServerRunning) {
    await checkApiEndpoints();
  }
  
  // Determine what's the actual issue
  const connectionIssue = !remoteServerRunning;
  const serviceAvailable = remoteServerRunning; 
  
  console.log('\n======================================');
  console.log('DIAGNOSIS & RECOMMENDATIONS:');
  
  if (connectionIssue) {
    console.log('\n✖ CONNECTION ISSUE DETECTED');
    console.log('-----------------------------');
    console.log('1. The render.com server is not responding or is unreachable');
    console.log('2. This could be due to:');
    console.log('   - The server might be down for maintenance');
    console.log('   - The free tier on render.com might have spun down due to inactivity');
    console.log('   - Network connectivity issues from your location');
    console.log('3. Recommended actions:');
    console.log('   - Check the render.com dashboard to see if your service is running');
    console.log('   - If using free tier, the first request after inactivity might take 1-2 minutes to start up');
    console.log('   - Try accessing https://game-39rz.onrender.com directly in a browser');
    console.log('   - Start your local backend server as a temporary alternative');
  } else if (serviceAvailable) {
    console.log('\n✓ SERVER IS RUNNING');
    console.log('--------------------');
    console.log('The server appears to be responding, but there may still be authentication issues:');
    console.log('1. The admin account may be locked due to too many failed login attempts');
    console.log('2. Based on the Admin.js model, the account will be locked for 2 hours');
    console.log('3. Wait before attempting to login again, or reset the account if possible');
    console.log('4. Make sure to use the exact credentials: admin@numbergame.com / Admin@123');
  }
  
  // Local backend recommendations
  if (!localServerRunning && connectionIssue) {
    console.log('\nLOCAL BACKEND OPTION:');
    console.log('----------------------');
    console.log('1. Start your local backend server:');
    console.log('   cd d:\\GAME999\\backend && npm start');
    console.log('2. Update your admin/.env to use local API:');
    console.log('   REACT_APP_API_URL=http://localhost:5000/api');
    console.log('3. Restart your React application after making these changes');
  }
  
  console.log('======================================');
}

runTests().catch(err => {
  console.error('Test script error:', err);
});
