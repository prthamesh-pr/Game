/**
 * Setup Cloud Database with Users and Admins
 * Creates users and admins in the MongoDB Atlas database that the API server uses
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function setupCloudDatabase() {
  try {
    // Connect to the same database as the API server (MongoDB Atlas)
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://963sohamraut:tiIJDdXD8oSGbrfD@game.h39d7ua.mongodb.net/numbergame?retryWrites=true&w=majority&appName=Game';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas (same as API server)');
    console.log('📍 Database:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas Cloud' : 'Local MongoDB');

    // Clear existing users and admins to start fresh
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Admin.deleteMany({});
    console.log('✅ Cleared existing users and admins');

    // Create test users
    console.log('\n👥 Creating Test Users...');
    
    const testUsers = [
      {
        username: 'testuser1',
        email: 'test1@example.com',
        passwordHash: 'Test123',
        mobileNumber: '9876543210'
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        passwordHash: 'Test123',
        mobileNumber: '8765432109'
      },
      {
        username: 'demouser',
        email: 'demo@numbergame.com',
        passwordHash: 'Demo123',
        mobileNumber: '7654321098'
      }
    ];

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.email})`);
      
      // Test login immediately
      try {
        const testUser = await User.findByCredentials(userData.email, userData.passwordHash);
        console.log(`   ✅ Login test passed for ${userData.email}`);
      } catch (error) {
        console.log(`   ❌ Login test failed for ${userData.email}:`, error.message);
      }
    }

    // Create admin users
    console.log('\n👨‍💼 Creating Admin Users...');
    
    const adminUsers = [
      {
        email: '963prathamesh@gmail.com',
        passwordHash: 'Admin@123',
        fullName: 'Prathamesh Raut',
        role: 'super-admin'
      },
      {
        email: '963sohamraut@gmail.com',
        passwordHash: 'Admin@123',
        fullName: 'Soham Raut',
        role: 'super-admin'
      },
      {
        email: 'admin@numbergame.com',
        passwordHash: 'Admin@123',
        fullName: 'Default Administrator',
        role: 'super-admin'
      }
    ];

    for (const adminData of adminUsers) {
      const admin = new Admin({
        ...adminData,
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
      console.log(`✅ Created admin: ${adminData.fullName} (${adminData.email})`);
      
      // Test login immediately
      try {
        const testAdmin = await Admin.findByCredentials(adminData.email, adminData.passwordHash);
        console.log(`   ✅ Login test passed for ${adminData.email}`);
      } catch (error) {
        console.log(`   ❌ Login test failed for ${adminData.email}:`, error.message);
      }
    }

    // Add wallet balance to users
    console.log('\n💰 Adding wallet balance to users...');
    await User.updateMany({}, { $set: { walletBalance: 1000, wallet: 1000 } });
    console.log('✅ Added 1000 balance to all users');

    // Test API endpoints
    console.log('\n🔍 Testing API Endpoints...');
    
    // Wait a moment for the server to sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const axios = require('axios');
    
    // Test user login
    try {
      const userResponse = await axios.post('http://localhost:5000/api/auth/login', {
        identifier: 'test1@example.com',
        password: 'Test123'
      });
      console.log('✅ User Login API successful:', userResponse.data.message);
      console.log('   👤 User:', userResponse.data.user.username);
      console.log('   🔑 Token generated:', !!userResponse.data.token);
    } catch (error) {
      console.log('❌ User Login API failed:', error.response?.data?.message || error.message);
    }
    
    // Test admin login
    try {
      const adminResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email: '963prathamesh@gmail.com',
        password: 'Admin@123'
      });
      console.log('✅ Admin Login API successful:', adminResponse.data.message);
      console.log('   👤 Admin:', adminResponse.data.data.admin.fullName);
      console.log('   🔑 Token generated:', !!adminResponse.data.data.token);
    } catch (error) {
      console.log('❌ Admin Login API failed:', error.response?.data?.message || error.message);
    }

    // List final data
    const finalUsers = await User.find({}, { passwordHash: 0 });
    const finalAdmins = await Admin.find({}, { passwordHash: 0 });
    
    console.log('\n📊 Final Database State:');
    console.log(`   Users: ${finalUsers.length}`);
    console.log(`   Admins: ${finalAdmins.length}`);
    
    console.log('\n🔐 Working Credentials:');
    console.log('   User Accounts:');
    testUsers.forEach(user => {
      console.log(`     ${user.email} / ${user.username} - Password: ${user.passwordHash}`);
    });
    
    console.log('   Admin Accounts:');
    adminUsers.forEach(admin => {
      console.log(`     ${admin.email} - Password: ${admin.passwordHash}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
setupCloudDatabase();
