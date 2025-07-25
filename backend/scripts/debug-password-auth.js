/**
 * Debug Password Authentication
 * Tests password authentication step by step
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function debugPasswordAuth() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Test user authentication
    console.log('🔍 Testing User Authentication...');
    const testUser = await User.findOne({ email: 'test456@example.com' });
    if (testUser) {
      console.log('   📧 User Email:', testUser.email);
      console.log('   👤 Username:', testUser.username);
      console.log('   🔐 Password Hash:', testUser.passwordHash);
      
      // Test with correct password
      const correctPassword = 'Test123';
      console.log(`   🔍 Testing with password: "${correctPassword}"`);
      
      const isCorrect = await bcrypt.compare(correctPassword, testUser.passwordHash);
      console.log('   ✅ Password match result:', isCorrect);
      
      // Test with user's method
      const methodResult = await testUser.checkPassword(correctPassword);
      console.log('   ✅ User method result:', methodResult);
      
      // Test findByCredentials
      try {
        const foundUser = await User.findByCredentials(testUser.email, correctPassword);
        console.log('   ✅ findByCredentials successful:', foundUser.email);
      } catch (error) {
        console.log('   ❌ findByCredentials failed:', error.message);
      }
      
      // Test with wrong password
      const wrongPassword = 'wrongpass';
      console.log(`   🔍 Testing with wrong password: "${wrongPassword}"`);
      try {
        await User.findByCredentials(testUser.email, wrongPassword);
        console.log('   ❌ Wrong password accepted (This is a problem!)');
      } catch (error) {
        console.log('   ✅ Wrong password correctly rejected:', error.message);
      }
    }

    // Test admin authentication
    console.log('\n🔍 Testing Admin Authentication...');
    const testAdmin = await Admin.findOne({ email: '963prathamesh@gmail.com' });
    if (testAdmin) {
      console.log('   📧 Admin Email:', testAdmin.email);
      console.log('   👤 Admin Name:', testAdmin.fullName);
      console.log('   🔐 Password Hash:', testAdmin.passwordHash);
      
      // Test with correct password
      const correctAdminPassword = 'Admin@123';
      console.log(`   🔍 Testing with password: "${correctAdminPassword}"`);
      
      const isAdminCorrect = await bcrypt.compare(correctAdminPassword, testAdmin.passwordHash);
      console.log('   ✅ Password match result:', isAdminCorrect);
      
      // Test with admin's method
      const adminMethodResult = await testAdmin.checkPassword(correctAdminPassword);
      console.log('   ✅ Admin method result:', adminMethodResult);
      
      // Test findByCredentials
      try {
        const foundAdmin = await Admin.findByCredentials(testAdmin.email, correctAdminPassword);
        console.log('   ✅ findByCredentials successful:', foundAdmin.email);
      } catch (error) {
        console.log('   ❌ findByCredentials failed:', error.message);
      }
    }

    // Test API endpoint directly
    console.log('\n🔍 Testing API Endpoints...');
    const axios = require('axios');
    
    // Test user login API
    try {
      const userLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        identifier: 'test456@example.com',
        password: 'Test123'
      });
      console.log('   ✅ User Login API successful:', userLoginResponse.data.success);
    } catch (error) {
      console.log('   ❌ User Login API failed:', error.response?.data?.message || error.message);
    }
    
    // Test admin login API
    try {
      const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email: '963prathamesh@gmail.com',
        password: 'Admin@123'
      });
      console.log('   ✅ Admin Login API successful:', adminLoginResponse.data.success);
    } catch (error) {
      console.log('   ❌ Admin Login API failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
debugPasswordAuth();
