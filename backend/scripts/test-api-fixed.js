/**
 * Fixed API Test Script for Game 999
 * Tests all endpoints with better error handling and body formatting
 */

const axios = require('axios');

const BASE_URL = 'https://game-39rz.onrender.com';
let userToken = '';
let adminToken = '';

// Generate unique test data to avoid conflicts
const timestamp = Date.now();
const uniqueId = Math.random().toString(36).substring(7);

// Test configuration with unique values to avoid conflicts
const testUser = {
  username: `apitest${timestamp}`,
  email: `apitest${timestamp}@example.com`,
  password: 'Test123!',
  mobileNumber: `987654${timestamp.toString().slice(-4)}`
};

const testAdmin = {
  email: 'admin@numbergame.com',
  password: 'Admin@123'
};

class APITester {
  constructor() {
    this.results = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async test(name, testFunction) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFunction();
      console.log(`✅ PASSED: ${name}`);
      this.passedTests++;
      this.results.push({ name, status: 'PASSED' });
    } catch (error) {
      let errorMessage = error.message;
      if (error.response) {
        errorMessage = `${error.response.status} - ${JSON.stringify(error.response.data)}`;
      }
      console.log(`❌ FAILED: ${name} - ${errorMessage}`);
      this.failedTests++;
      this.results.push({ name, status: 'FAILED', error: errorMessage });
    }
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async makeRequest(endpoint, method = 'GET', data = null, token = null) {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    };

    // Only add data if method supports it and data is not null
    if (method !== 'GET' && method !== 'DELETE' && data !== null) {
      config.data = data;
    }

    // Add authorization header if token provided
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios(config);
    return response.data;
  }

  async runAllTests() {
    console.log('🚀 Starting Fixed API Tests for Game 999');
    console.log(`📍 Base URL: ${BASE_URL}\n`);

    // Test 1: Health Check
    await this.test('Health Check', async () => {
      const result = await this.makeRequest('/health');
      if (!result.success) throw new Error(result.message || 'Health check failed');
    });

    // Test 2: API Base Route
    await this.test('API Base Route', async () => {
      const result = await this.makeRequest('/api');
      if (!result.success) throw new Error(result.message || 'API base route failed');
    });

    // Test 3: User Registration
    await this.test('User Registration', async () => {
      const result = await this.makeRequest('/api/auth/register', 'POST', testUser);
      if (!result.success) throw new Error(result.message);
      userToken = result.token;
    });

    // Test 4: User Login
    await this.test('User Login', async () => {
      const result = await this.makeRequest('/api/auth/login', 'POST', {
        identifier: testUser.username,
        password: testUser.password
      });
      if (!result.success) throw new Error(result.message);
      userToken = result.token || userToken; // Update token if provided
    });

    // Test 5: Admin Login
    await this.test('Admin Login', async () => {
      const result = await this.makeRequest('/api/auth/admin/login', 'POST', testAdmin);
      if (!result.data || !result.data.token) throw new Error(result.message || 'No admin token received');
      adminToken = result.data.token;
    });

    // Test 6: Verify User Token
    await this.test('Verify User Token', async () => {
      const result = await this.makeRequest('/api/auth/verify', 'GET', null, userToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 7: Get Current Round
    await this.test('Get Current Round', async () => {
      const result = await this.makeRequest('/api/game/round/current');
      if (!result.success) throw new Error(result.message);
    });

    // Test 8: Get Valid Numbers
    await this.test('Get Valid Numbers', async () => {
      const result = await this.makeRequest('/api/game/numbers/A');
      if (!result.success) throw new Error(result.message);
    });

    // Test 9: Get Game Info
    await this.test('Get Game Info', async () => {
      const result = await this.makeRequest('/api/game/info');
      if (!result.success) throw new Error(result.message);
    });

    // Test 10: Get Recent Results
    await this.test('Get Recent Results', async () => {
      const result = await this.makeRequest('/api/game/results/recent');
      if (!result.success) throw new Error(result.message);
    });

    // Test 11: Get User Profile
    await this.test('Get User Profile', async () => {
      const result = await this.makeRequest('/api/user/profile', 'GET', null, userToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 12: Get User Stats
    await this.test('Get User Stats', async () => {
      const result = await this.makeRequest('/api/user/stats', 'GET', null, userToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 13: Get User Selections
    await this.test('Get User Selections', async () => {
      const result = await this.makeRequest('/api/user/selections', 'GET', null, userToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 14: Get Wallet Transactions
    await this.test('Get Wallet Transactions', async () => {
      const result = await this.makeRequest('/api/user/wallet/transactions', 'GET', null, userToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 15: Admin Dashboard Stats
    await this.test('Admin Dashboard Stats', async () => {
      const result = await this.makeRequest('/api/admin/dashboard', 'GET', null, adminToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 16: Get All Users (Admin)
    await this.test('Get All Users (Admin)', async () => {
      const result = await this.makeRequest('/api/admin/users', 'GET', null, adminToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 17: Get All Results (Admin)
    await this.test('Get All Results (Admin)', async () => {
      const result = await this.makeRequest('/api/admin/results', 'GET', null, adminToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 18: Get Current Selections
    await this.test('Get Current Selections', async () => {
      const result = await this.makeRequest('/api/game/selections/current', 'GET', null, userToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 19: Get All Rounds
    await this.test('Get All Rounds', async () => {
      const result = await this.makeRequest('/api/game/rounds');
      if (!result.success) throw new Error(result.message);
    });

    // Test 20: Select Number (Game) - This requires proper authentication
    await this.test('Select Number (Game)', async () => {
      const result = await this.makeRequest('/api/game/select', 'POST', {
        classType: 'A',
        number: '102', // Sum = 3, divisible by 3, so class A
        amount: 10
      }, userToken);
      if (!result.success) throw new Error(result.message);
    });

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

    if (this.failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }

    console.log('\n🎉 API Testing Complete!');
  }
}

// Run the tests
const tester = new APITester();
tester.runAllTests().catch(console.error);
