/**
 * Comprehensive API Test Script
 * Tests all backend APIs and creates necessary test data
 * Run with: npm run test-apis
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const Admin = require('../models/Admin');
const Agent = require('../models/Agent');
const Round = require('../models/Round');
const Bet = require('../models/Bet');
const Result = require('../models/Result');
const bcrypt = require('bcrypt');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

class APITester {
  constructor() {
    this.userToken = null;
    this.adminToken = null;
    this.agentToken = null;
    this.testUser = null;
    this.testAdmin = null;
    this.testAgent = null;
    this.activeRound = null;
  }

  async connectDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/number-game');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async setupTestData() {
    console.log('\n🔧 Setting up test data...');

    try {
      // Clean up existing test data
      await User.deleteMany({ email: { $in: ['testuser@example.com', 'apitest@example.com'] } });
      await Admin.deleteMany({ email: { $in: ['testadmin@example.com', '963sohamraut@gmail.com'] } });
      await Agent.deleteMany({ mobile: { $in: ['9999999999', 'agent1'] } });

      // Create test user
      const userPassword = await bcrypt.hash('testpass123', 12);
      this.testUser = await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        passwordHash: userPassword,
        mobileNumber: '9999999999',
        walletBalance: 1000,
        isActive: true
      });

      // Create test admin
      const adminPassword = await bcrypt.hash('admin123', 12);
      this.testAdmin = await Admin.create({
        username: 'testadmin',
        email: 'testadmin@example.com',
        passwordHash: adminPassword,
        fullName: 'Test Admin',
        role: 'admin',
        permissions: {
          canViewReports: true,
          canManageUsers: true,
          canManageGames: true,
          canManageWallet: true
        }
      });

      // Create test agent
      this.testAgent = await Agent.create({
        fullName: 'Test Agent',
        mobile: '9999999999',
        password: 'agentpass123',
        referralCode: 'TESTAGENT',
        commission: 5
      });

      // Create active round
      this.activeRound = await Round.create({
        gameClass: 'A',
        timeSlot: '10:00',
        status: 'active'
      });

      console.log('✅ Test data created successfully');
      console.log(`   - User: ${this.testUser.email}`);
      console.log(`   - Admin: ${this.testAdmin.email}`);
      console.log(`   - Agent: ${this.testAgent.mobile}`);
      console.log(`   - Round: ${this.activeRound.gameClass}-${this.activeRound.timeSlot}`);

    } catch (error) {
      console.error('❌ Test data setup failed:', error.message);
      throw error;
    }
  }

  async testUserAuthentication() {
    console.log('\n🔐 Testing User Authentication...');

    try {
      // Test user registration
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        username: 'apitest',
        email: 'apitest@example.com',
        password: 'testpass123',
        mobileNumber: '8888888888'
      });

      console.log('✅ User registration successful');

      // Test user login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        identifier: 'testuser@example.com',
        password: 'testpass123'
      });

      this.userToken = loginResponse.data.token;
      console.log('✅ User login successful');

      // Test token verification
      const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Token verification successful');
      return true;

    } catch (error) {
      console.error('❌ User authentication failed:', error.response?.data || error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('💡 Make sure the backend server is running on port 5000');
      }
      return false;
    }
  }

  async testGameAPIs() {
    console.log('\n🎮 Testing Game APIs...');

    try {
      // Test get current round
      const roundResponse = await axios.get(`${BASE_URL}/current-round`);
      console.log('✅ Get current round successful');

      // Test get game numbers
      const numbersResponse = await axios.get(`${BASE_URL}/numbers`);
      console.log('✅ Get game numbers successful');

      // Test place bet
      const betResponse = await axios.post(`${BASE_URL}/bet`, {
        gameClass: 'A',
        selectedNumber: 123,
        betAmount: 100
      }, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Place bet successful');

      // Test get user bets
      const userBetsResponse = await axios.get(`${BASE_URL}/bets`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Get user bets successful');

      // Test get results
      const resultsResponse = await axios.get(`${BASE_URL}/results`);
      console.log('✅ Get results successful');

      return true;

    } catch (error) {
      console.error('❌ Game APIs failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testWalletAPIs() {
    console.log('\n💰 Testing Wallet APIs...');

    try {
      // Test get wallet balance
      const balanceResponse = await axios.get(`${BASE_URL}/balance`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Get wallet balance successful');

      // Test add balance request
      const addBalanceResponse = await axios.post(`${BASE_URL}/wallet/add`, {
        amount: 500,
        upiId: 'test@upi',
        userName: 'Test User',
        paymentApp: 'GooglePay',
        referralNumber: 'REF123',
        phoneNumber: '9999999999'
      }, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Add balance request successful');

      // Test withdraw request
      const withdrawResponse = await axios.post(`${BASE_URL}/wallet/withdraw`, {
        amount: 200,
        phoneNumber: '9999999999',
        paymentApp: 'GooglePay',
        referralNumber: 'REF123'
      }, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Withdraw request successful');

      // Test get transactions
      const transactionsResponse = await axios.get(`${BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Get transactions successful');

      return true;

    } catch (error) {
      console.error('❌ Wallet APIs failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testUserAPIs() {
    console.log('\n👤 Testing User APIs...');

    try {
      // Test get user profile
      const profileResponse = await axios.get(`${BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Get user profile successful');

      // Test update profile
      const updateResponse = await axios.put(`${BASE_URL}/user/update`, {
        username: 'updateduser',
        email: 'testuser@example.com',
        mobileNumber: '9999999999'
      }, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Update user profile successful');

      // Test change password
      const changePasswordResponse = await axios.post(`${BASE_URL}/user/change-password`, {
        currentPassword: 'testpass123',
        newPassword: 'newpass123'
      }, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Change password successful');

      return true;

    } catch (error) {
      console.error('❌ User APIs failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testQRAPIs() {
    console.log('\n📱 Testing QR Code APIs...');

    try {
      // Test generate QR code
      const qrResponse = await axios.post(`${BASE_URL}/qr/generate`, {
        amount: 100,
        paymentApp: 'GooglePay',
        upiId: 'test@upi'
      }, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Generate QR code successful');

      // Test get QR codes list
      const qrListResponse = await axios.get(`${BASE_URL}/qr/list`, {
        headers: { Authorization: `Bearer ${this.userToken}` }
      });

      console.log('✅ Get QR codes list successful');

      return true;

    } catch (error) {
      console.error('❌ QR APIs failed:', error.response?.data || error.message);
      return false;
    }
  }

  async testAdminAuthentication() {
    console.log('\n🔑 Testing Admin Authentication...');

    try {
      // Test admin login
      const adminLoginResponse = await axios.post(`${BASE_URL}/admin/login`, {
        email: 'testadmin@example.com',
        password: 'admin123'
      });

      this.adminToken = adminLoginResponse.data.token;
      console.log('✅ Admin login successful');

      return true;

    } catch (error) {
      console.error('❌ Admin authentication failed:', error.response?.data || error.message);
      return false;
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    try {
      // Remove test data
      await User.deleteMany({ email: { $in: ['testuser@example.com', 'apitest@example.com'] } });
      await Admin.deleteMany({ email: 'testadmin@example.com' });
      await Agent.deleteMany({ mobile: '9999999999' });
      await Bet.deleteMany({ userId: this.testUser?._id });
      await Round.deleteMany({ gameClass: this.activeRound?.gameClass, timeSlot: this.activeRound?.timeSlot });

      console.log('✅ Test data cleaned up');

    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive API Tests...');
    console.log(`📍 Testing against: ${BASE_URL}`);
    console.log('💡 Make sure the backend server is running: npm start');

    let passedTests = 0;
    let totalTests = 0;

    try {
      await this.connectDatabase();
      await this.setupTestData();

      // Run all test suites
      const tests = [
        { name: 'User Authentication', fn: () => this.testUserAuthentication() },
        { name: 'Game APIs', fn: () => this.testGameAPIs() },
        { name: 'Wallet APIs', fn: () => this.testWalletAPIs() },
        { name: 'User APIs', fn: () => this.testUserAPIs() },
        { name: 'QR APIs', fn: () => this.testQRAPIs() },
        { name: 'Admin Authentication', fn: () => this.testAdminAuthentication() }
      ];

      for (const test of tests) {
        totalTests++;
        try {
          const result = await test.fn();
          if (result) passedTests++;
        } catch (error) {
          console.error(`❌ ${test.name} test suite failed:`, error.message);
        }
      }

      await this.cleanup();

    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
    } finally {
      await mongoose.connection.close();
      
      console.log('\n📊 Test Summary:');
      console.log(`✅ Passed: ${passedTests}/${totalTests} test suites`);
      console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} test suites`);
      
      if (passedTests === totalTests) {
        console.log('🎉 All API tests passed successfully!');
        process.exit(0);
      } else {
        console.log('⚠️  Some tests failed. Check the logs above.');
        process.exit(1);
      }
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;
