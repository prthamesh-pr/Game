/**
 * Test User Login Script
 * Tests user login with detailed debugging
 */

const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');

async function testUserLogin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}, { passwordHash: 0 });
    console.log('\n👥 AVAILABLE USERS:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.email})`);
      if (user.mobileNumber) {
        console.log(`      📱 Mobile: ${user.mobileNumber}`);
      }
      console.log(`      🔐 Active: ${user.isActive}`);
    });

    // Test credentials from database export
    const testCredentials = [
      { identifier: 'testuser456', password: 'Test123' },
      { identifier: 'test456@example.com', password: 'Test123' },
      { identifier: 'localtest123', password: 'Test123!' },
      { identifier: 'localtest@example.com', password: 'Test123!' },
      { identifier: '9876543210', password: 'Test123!' }
    ];

    console.log('\n🔍 TESTING LOGIN API CALLS:');
    
    for (const cred of testCredentials) {
      console.log(`\n   Testing: ${cred.identifier} / ${cred.password}`);
      
      // Test direct database method first
      try {
        const user = await User.findByCredentials(cred.identifier, cred.password);
        console.log(`   ✅ Database: SUCCESS (${user.email})`);
      } catch (error) {
        console.log(`   ❌ Database: FAILED (${error.message})`);
        continue; // Skip API test if DB fails
      }

      // Test API call
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          identifier: cred.identifier,
          password: cred.password
        });
        console.log(`   ✅ API: SUCCESS (${response.data.user.email})`);
      } catch (error) {
        console.log(`   ❌ API: FAILED (${error.response?.data?.message || error.message})`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 MongoDB connection closed');
  }
}

// Run the script
testUserLogin();
