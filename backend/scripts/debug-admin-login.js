/**
 * Debug Admin Login Script
 * Tests the admin login process step by step
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function debugAdminLogin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const testEmail = '963prathamesh@gmail.com';
    const testPassword = 'Admin@123';

    // Find the admin first
    const admin = await Admin.findOne({ email: testEmail });
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }

    console.log('✅ Admin found:');
    console.log('   📧 Email:', admin.email);
    console.log('   👤 Name:', admin.fullName);
    console.log('   🔐 Active:', admin.isActive);
    console.log('   🚫 Locked:', admin.isLocked);
    console.log('   🔢 Login Attempts:', admin.loginAttempts);
    console.log('   🔑 Password Hash Length:', admin.passwordHash.length);
    console.log('   🔑 Password Hash Preview:', admin.passwordHash.substring(0, 20) + '...');

    // Test password comparison manually
    console.log('\n🔍 Testing password comparison...');
    const isPasswordMatch = await bcrypt.compare(testPassword, admin.passwordHash);
    console.log('   Password match result:', isPasswordMatch);

    // Test the built-in method
    console.log('\n🔍 Testing admin.checkPassword method...');
    const isMethodMatch = await admin.checkPassword(testPassword);
    console.log('   Method match result:', isMethodMatch);

    // Try the findByCredentials method
    console.log('\n🔍 Testing findByCredentials method...');
    try {
      const foundAdmin = await Admin.findByCredentials(testEmail, testPassword);
      console.log('✅ findByCredentials successful:', foundAdmin.email);
    } catch (error) {
      console.log('❌ findByCredentials failed:', error.message);
    }

    // Also test creating a fresh admin to compare
    console.log('\n🔍 Creating a test admin for comparison...');
    const testAdminData = {
      email: 'test-debug@example.com',
      passwordHash: testPassword, // This will be hashed by pre-save
      fullName: 'Debug Test Admin',
      role: 'admin',
      permissions: {
        canManageUsers: true,
        canManageWallets: true,
        canSetResults: true,
        canViewReports: true,
        canManageAdmins: false
      }
    };

    // Remove test admin if exists
    await Admin.deleteOne({ email: testAdminData.email });
    
    const testAdmin = new Admin(testAdminData);
    await testAdmin.save();
    console.log('✅ Test admin created');

    // Test the new admin login
    try {
      const testResult = await Admin.findByCredentials(testAdminData.email, testPassword);
      console.log('✅ Test admin login successful:', testResult.email);
    } catch (error) {
      console.log('❌ Test admin login failed:', error.message);
    }

    // Clean up test admin
    await Admin.deleteOne({ email: testAdminData.email });
    console.log('🗑️  Test admin cleaned up');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
debugAdminLogin();
