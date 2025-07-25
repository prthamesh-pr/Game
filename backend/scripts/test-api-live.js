/**
 * API Test Script for Game 999
 * Tests all endpoints using the production URL
 */

const axios = require('axios');

const BASE_URL = 'https://game-39rz.onrender.com';
let userToken = '';
let adminToken = '';

// Test configuration
const testUser = {
  username: 'apitest123',
  email: 'apitest@example.com',
  password: 'Test123!',
  mobileNumber: '9876543210'
};

const testAdmin = {
  username: 'admin',
  password: 'admin123'
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

  async testPublicEndpoint(endpoint, method = 'GET', data = null) {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  async testAuthEndpoint(endpoint, method = 'GET', data = null, token = userToken) {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }

  async runAllTests() {
    console.log('🚀 Starting API Tests for Game 999');
    console.log(`📍 Base URL: ${BASE_URL}\n`);

    // Test 1: User Registration
    await this.test('User Registration', async () => {
      const result = await this.testPublicEndpoint('/api/auth/register', 'POST', testUser);
      if (!result.success) throw new Error(result.message);
      userToken = result.token;
    });

    // Test 2: User Login
    await this.test('User Login', async () => {
      const result = await this.testPublicEndpoint('/api/auth/login', 'POST', {
        identifier: testUser.username,
        password: testUser.password
      });
      if (!result.success) throw new Error(result.message);
    });

    // Test 3: Admin Login
    await this.test('Admin Login', async () => {
      const result = await this.testPublicEndpoint('/api/auth/admin/login', 'POST', testAdmin);
      if (!result.success) throw new Error(result.message);
      adminToken = result.token;
    });

    // Test 4: Verify User Token
    await this.test('Verify User Token', async () => {
      const result = await this.testAuthEndpoint('/api/auth/verify');
      if (!result.success) throw new Error(result.message);
    });

    // Test 5: Get Current Round
    await this.test('Get Current Round', async () => {
      const result = await this.testPublicEndpoint('/api/game/current');
      if (!result.success) throw new Error(result.message);
    });

    // Test 6: Get Valid Numbers
    await this.test('Get Valid Numbers', async () => {
      const result = await this.testPublicEndpoint('/api/game/numbers');
      if (!result.success) throw new Error(result.message);
    });

    // Test 7: Get Game Info
    await this.test('Get Game Info', async () => {
      const result = await this.testPublicEndpoint('/api/game/info');
      if (!result.success) throw new Error(result.message);
    });

    // Test 8: Get Recent Results
    await this.test('Get Recent Results', async () => {
      const result = await this.testPublicEndpoint('/api/game/results');
      if (!result.success) throw new Error(result.message);
    });

    // Test 9: Get User Profile
    await this.test('Get User Profile', async () => {
      const result = await this.testAuthEndpoint('/api/user/profile');
      if (!result.success) throw new Error(result.message);
    });

    // Test 10: Get User Stats
    await this.test('Get User Stats', async () => {
      const result = await this.testAuthEndpoint('/api/user/stats');
      if (!result.success) throw new Error(result.message);
    });

    // Test 11: Get User Selections
    await this.test('Get User Selections', async () => {
      const result = await this.testAuthEndpoint('/api/user/selections');
      if (!result.success) throw new Error(result.message);
    });

    // Test 12: Get Wallet Transactions
    await this.test('Get Wallet Transactions', async () => {
      const result = await this.testAuthEndpoint('/api/user/transactions');
      if (!result.success) throw new Error(result.message);
    });

    // Test 13: Admin Dashboard Stats
    await this.test('Admin Dashboard Stats', async () => {
      const result = await this.testAuthEndpoint('/api/admin/dashboard', 'GET', null, adminToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 14: Get All Users (Admin)
    await this.test('Get All Users (Admin)', async () => {
      const result = await this.testAuthEndpoint('/api/admin/users', 'GET', null, adminToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 15: Get All Results (Admin)
    await this.test('Get All Results (Admin)', async () => {
      const result = await this.testAuthEndpoint('/api/admin/results', 'GET', null, adminToken);
      if (!result.success) throw new Error(result.message);
    });

    // Test 16: Select Number (Game)
    await this.test('Select Number (Game)', async () => {
      const result = await this.testAuthEndpoint('/api/game/select', 'POST', {
        gameClass: 'A',
        number: '123',
        amount: 10
      });
      // This might fail if user doesn't have enough balance, that's okay
      if (!result.success && !result.message.includes('insufficient')) {
        throw new Error(result.message);
      }
    });

    // Test 17: Get Current Selections
    await this.test('Get Current Selections', async () => {
      const result = await this.testAuthEndpoint('/api/game/selections');
      if (!result.success) throw new Error(result.message);
    });

    // Test 18: Get All Rounds
    await this.test('Get All Rounds', async () => {
      const result = await this.testPublicEndpoint('/api/game/rounds');
      if (!result.success) throw new Error(result.message);
    });

    // Print Summary
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
