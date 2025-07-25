/**
 * JSON Export Script for Users and Admins
 * Creates detailed JSON files with all data
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function exportToJSON() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).lean().sort({ createdAt: -1 });
    
    // Get all admins
    const admins = await Admin.find({}).lean().sort({ createdAt: -1 });

    // Test passwords for users
    const commonPasswords = ['Test123', 'test123', 'Test123!', 'Admin@123', 'password', 'Password123'];
    for (const user of users) {
      for (const testPassword of commonPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.passwordHash);
          if (isMatch) {
            user.originalPassword = testPassword;
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      if (!user.originalPassword) {
        user.originalPassword = 'Unknown';
      }
    }

    // Test passwords for admins
    const adminPasswords = ['Admin@123', 'admin123', 'Admin123', 'password'];
    for (const admin of admins) {
      for (const testPassword of adminPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, admin.passwordHash);
          if (isMatch) {
            admin.originalPassword = testPassword;
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      if (!admin.originalPassword) {
        admin.originalPassword = 'Unknown';
      }
    }

    // Create comprehensive export object
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalAdmins: admins.length,
        totalAccounts: users.length + admins.length,
        activeUsers: users.filter(u => u.isActive).length,
        activeAdmins: admins.filter(a => a.isActive).length,
        usersWithBalance: users.filter(u => (u.walletBalance || u.wallet || 0) > 0).length,
        lockedAdmins: admins.filter(a => a.isLocked).length
      },
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber || null,
        passwordHash: user.passwordHash,
        originalPassword: user.originalPassword,
        walletBalance: user.walletBalance || user.wallet || 0,
        gamesPlayed: user.gamesPlayed || 0,
        totalWinnings: user.totalWinnings || 0,
        totalLosses: user.totalLosses || 0,
        role: user.role,
        isActive: user.isActive,
        isGuest: user.isGuest || false,
        selectedNumbers: user.selectedNumbers || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      })),
      admins: admins.map(admin => ({
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        passwordHash: admin.passwordHash,
        originalPassword: admin.originalPassword,
        role: admin.role,
        isActive: admin.isActive,
        isLocked: admin.isLocked,
        loginAttempts: admin.loginAttempts || 0,
        lockUntil: admin.lockUntil || null,
        permissions: admin.permissions || {},
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
        lastLogin: admin.lastLogin
      })),
      workingCredentials: {
        admins: [
          { email: 'admin@numbergame.com', password: 'Admin@123' },
          { email: '963sohamraut@gmail.com', password: 'Admin@123' },
          { email: '963prathamesh@gmail.com', password: 'Admin@123' }
        ],
        users: users.filter(u => u.originalPassword !== 'Unknown').map(u => ({
          email: u.email,
          username: u.username,
          password: u.originalPassword
        }))
      }
    };

    // Write to JSON file
    const exportPath = path.join(__dirname, 'database-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('📄 JSON export created successfully!');
    console.log(`📁 Location: ${exportPath}`);
    console.log('');

    // Create a simple credentials file
    const credentialsData = {
      adminCredentials: [
        { email: 'admin@numbergame.com', password: 'Admin@123', name: 'Default Administrator' },
        { email: '963sohamraut@gmail.com', password: 'Admin@123', name: 'Soham Raut' },
        { email: '963prathamesh@gmail.com', password: 'Admin@123', name: 'Prathamesh Raut' }
      ],
      userCredentials: users.filter(u => u.originalPassword !== 'Unknown').map(u => ({
        email: u.email,
        username: u.username,
        password: u.originalPassword,
        mobileNumber: u.mobileNumber
      }))
    };

    const credentialsPath = path.join(__dirname, 'credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentialsData, null, 2));
    
    console.log('🔐 Credentials file created successfully!');
    console.log(`📁 Location: ${credentialsPath}`);
    console.log('');

    // Print summary table
    console.log('📋 QUICK REFERENCE TABLE:');
    console.log('==========================');
    console.log('');
    console.log('👨‍💼 ADMIN ACCOUNTS:');
    console.log('┌─────────────────────────────────┬───────────────────────┬─────────────────────┐');
    console.log('│ Email                           │ Password              │ Name                │');
    console.log('├─────────────────────────────────┼───────────────────────┼─────────────────────┤');
    admins.forEach(admin => {
      const email = admin.email.padEnd(31);
      const password = admin.originalPassword.padEnd(21);
      const name = (admin.fullName || 'Unknown').padEnd(19);
      console.log(`│ ${email} │ ${password} │ ${name} │`);
    });
    console.log('└─────────────────────────────────┴───────────────────────┴─────────────────────┘');
    console.log('');
    
    console.log('👥 USER ACCOUNTS:');
    console.log('┌─────────────────────────────────┬─────────────────┬───────────────┬──────────────┐');
    console.log('│ Email                           │ Username        │ Password      │ Mobile       │');
    console.log('├─────────────────────────────────┼─────────────────┼───────────────┼──────────────┤');
    users.forEach(user => {
      const email = user.email.padEnd(31);
      const username = user.username.padEnd(15);
      const password = user.originalPassword.padEnd(13);
      const mobile = (user.mobileNumber || 'N/A').padEnd(12);
      console.log(`│ ${email} │ ${username} │ ${password} │ ${mobile} │`);
    });
    console.log('└─────────────────────────────────┴─────────────────┴───────────────┴──────────────┘');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
exportToJSON();
