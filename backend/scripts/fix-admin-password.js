/**
 * Fix Admin Password Script
 * Properly recreates the admin with correct password hashing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function fixAdminPassword() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const email = '963prathamesh@gmail.com';
    const password = 'Admin@123';

    // Remove existing admin
    await Admin.deleteOne({ email });
    console.log('🗑️  Removed existing admin');

    // Create admin with correct password (let the pre-save middleware hash it)
    const admin = new Admin({
      email: email,
      passwordHash: password, // This will be hashed by pre-save middleware
      fullName: 'Prathamesh Raut',
      role: 'super-admin',
      permissions: {
        canManageUsers: true,
        canManageWallets: true,
        canSetResults: true,
        canViewReports: true,
        canManageAdmins: true
      },
      isActive: true,
      loginAttempts: 0
    });

    await admin.save();
    console.log('✅ Admin created successfully with pre-save hashing');

    // Test login immediately
    try {
      const testAdmin = await Admin.findByCredentials(email, password);
      console.log('✅ Admin login test successful!');
      console.log('   📧 Email:', testAdmin.email);
      console.log('   👤 Name:', testAdmin.fullName);
      console.log('   🔑 Role:', testAdmin.role);
    } catch (error) {
      console.error('❌ Admin login test failed:', error.message);
    }

    // Also fix the other admin accounts
    console.log('\n🔧 Fixing other admin accounts...');
    
    // Fix 963sohamraut@gmail.com
    await Admin.deleteOne({ email: '963sohamraut@gmail.com' });
    const sohamAdmin = new Admin({
      email: '963sohamraut@gmail.com',
      passwordHash: password,
      fullName: 'Soham Raut',
      role: 'super-admin',
      permissions: {
        canManageUsers: true,
        canManageWallets: true,
        canSetResults: true,
        canViewReports: true,
        canManageAdmins: true
      },
      isActive: true,
      loginAttempts: 0
    });
    await sohamAdmin.save();

    // Test Soham admin
    try {
      await Admin.findByCredentials('963sohamraut@gmail.com', password);
      console.log('✅ Soham admin login test successful!');
    } catch (error) {
      console.error('❌ Soham admin login test failed:', error.message);
    }

    // Fix admin@numbergame.com
    await Admin.deleteOne({ email: 'admin@numbergame.com' });
    const defaultAdmin = new Admin({
      email: 'admin@numbergame.com',
      passwordHash: password,
      fullName: 'Default Administrator',
      role: 'super-admin',
      permissions: {
        canManageUsers: true,
        canManageWallets: true,
        canSetResults: true,
        canViewReports: true,
        canManageAdmins: true
      },
      isActive: true,
      loginAttempts: 0
    });
    await defaultAdmin.save();

    // Test default admin
    try {
      await Admin.findByCredentials('admin@numbergame.com', password);
      console.log('✅ Default admin login test successful!');
    } catch (error) {
      console.error('❌ Default admin login test failed:', error.message);
    }

    console.log('\n✅ All admin accounts fixed!');
    console.log('📧 Working admin accounts:');
    console.log('   - 963prathamesh@gmail.com (Password: Admin@123)');
    console.log('   - 963sohamraut@gmail.com (Password: Admin@123)');
    console.log('   - admin@numbergame.com (Password: Admin@123)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
fixAdminPassword();
