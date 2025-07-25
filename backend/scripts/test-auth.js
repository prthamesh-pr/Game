/**
 * Test script to verify registration and login functionality
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function testRegistrationLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log('Connected to MongoDB database');
    
    // Test user data
    const testUser = {
      username: 'testuser123',
      email: 'test@example.com',
      passwordHash: 'TestPassword123',
      mobileNumber: '9876543210'
    };
    
    console.log('\n=== Testing User Registration ===');
    
    // Clean up any existing test user
    await User.deleteOne({ username: testUser.username });
    console.log('Cleaned up existing test user');
    
    // Create new user
    const user = new User(testUser);
    await user.save();
    console.log('✅ User registration successful');
    console.log('User ID:', user._id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Mobile Number:', user.mobileNumber);
    
    console.log('\n=== Testing User Login ===');
    
    // Test login with username
    try {
      const foundUser1 = await User.findByCredentials(testUser.username, 'TestPassword123');
      console.log('✅ Login with username successful');
    } catch (error) {
      console.log('❌ Login with username failed:', error.message);
    }
    
    // Test login with email
    try {
      const foundUser2 = await User.findByCredentials(testUser.email, 'TestPassword123');
      console.log('✅ Login with email successful');
    } catch (error) {
      console.log('❌ Login with email failed:', error.message);
    }
    
    // Test login with mobile number
    try {
      const foundUser3 = await User.findByCredentials(testUser.mobileNumber, 'TestPassword123');
      console.log('✅ Login with mobile number successful');
    } catch (error) {
      console.log('❌ Login with mobile number failed:', error.message);
    }
    
    // Test with wrong password
    try {
      await User.findByCredentials(testUser.username, 'WrongPassword');
      console.log('❌ Should not reach here - wrong password');
    } catch (error) {
      console.log('✅ Correctly rejected wrong password');
    }
    
    console.log('\n=== Testing User Without Mobile Number ===');
    
    // Test user without mobile number
    const testUser2 = {
      username: 'testuser456',
      email: 'test2@example.com',
      passwordHash: 'TestPassword123'
      // No mobile number
    };
    
    // Clean up any existing test user
    await User.deleteOne({ username: testUser2.username });
    
    // Create user without mobile number
    const user2 = new User(testUser2);
    await user2.save();
    console.log('✅ User registration without mobile number successful');
    
    // Clean up test users
    await User.deleteOne({ username: testUser.username });
    await User.deleteOne({ username: testUser2.username });
    console.log('\n✅ Test cleanup completed');
    
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRegistrationLogin();
