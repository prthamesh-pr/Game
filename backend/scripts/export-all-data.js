/**
 * Complete User and Admin Data Export Script
 * Shows all user and admin details including passwords (both hashed and original)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function exportAllData() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Get all users with complete data
    const users = await User.find({}).sort({ createdAt: -1 });

    console.log('👥 COMPLETE USERS DATA:');
    console.log('========================');
    if (users.length === 0) {
      console.log('No users found');
    } else {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log(`${i + 1}. USER DETAILS:`);
        console.log(`   🆔 ID: ${user._id}`);
        console.log(`   👤 Username: ${user.username}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   📱 Mobile: ${user.mobileNumber || 'Not provided'}`);
        console.log(`   🔐 Password Hash: ${user.passwordHash}`);
        console.log(`   💰 Wallet Balance: ${user.walletBalance || user.wallet || 0}`);
        console.log(`   🎮 Games Played: ${user.gamesPlayed || 0}`);
        console.log(`   🏆 Total Winnings: ${user.totalWinnings || 0}`);
        console.log(`   💸 Total Losses: ${user.totalLosses || 0}`);
        console.log(`   🔵 Role: ${user.role}`);
        console.log(`   ✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`   👻 Guest: ${user.isGuest ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${user.createdAt ? user.createdAt.toISOString() : 'Unknown'}`);
        console.log(`   📅 Updated: ${user.updatedAt ? user.updatedAt.toISOString() : 'Unknown'}`);
        console.log(`   📅 Last Login: ${user.lastLogin ? user.lastLogin.toISOString() : 'Never'}`);
        
        // Show selected numbers if any
        if (user.selectedNumbers) {
          console.log(`   🎯 Selected Numbers:`);
          ['classA', 'classB', 'classC'].forEach(cls => {
            if (user.selectedNumbers[cls] && user.selectedNumbers[cls].number) {
              console.log(`      - ${cls.toUpperCase()}: ${user.selectedNumbers[cls].number} (Amount: ${user.selectedNumbers[cls].amount || 0})`);
            }
          });
        }

        // Test common passwords to find the original password
        console.log(`   🔍 Password Testing:`);
        const commonPasswords = [
          'Test123', 'test123', 'Test123!', 'Admin@123', 'password', 'Password123',
          '123456', 'admin', 'user123', 'game123', 'number123'
        ];
        
        let foundPassword = null;
        for (const testPassword of commonPasswords) {
          try {
            const isMatch = await bcrypt.compare(testPassword, user.passwordHash);
            if (isMatch) {
              foundPassword = testPassword;
              break;
            }
          } catch (error) {
            // Continue testing
          }
        }
        
        if (foundPassword) {
          console.log(`   🔑 Original Password: ${foundPassword}`);
        } else {
          console.log(`   🔑 Original Password: Unable to determine (not in common list)`);
        }
        
        console.log('   ' + '─'.repeat(50));
        console.log('');
      }
    }

    // Get all admins with complete data
    const admins = await Admin.find({}).sort({ createdAt: -1 });

    console.log('👨‍💼 COMPLETE ADMINS DATA:');
    console.log('==========================');
    if (admins.length === 0) {
      console.log('No admins found');
    } else {
      for (let i = 0; i < admins.length; i++) {
        const admin = admins[i];
        console.log(`${i + 1}. ADMIN DETAILS:`);
        console.log(`   🆔 ID: ${admin._id}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   👤 Full Name: ${admin.fullName || 'Not provided'}`);
        console.log(`   🔐 Password Hash: ${admin.passwordHash}`);
        console.log(`   🔑 Role: ${admin.role}`);
        console.log(`   ✅ Active: ${admin.isActive ? 'Yes' : 'No'}`);
        console.log(`   🚫 Locked: ${admin.isLocked ? 'Yes' : 'No'}`);
        console.log(`   🔢 Login Attempts: ${admin.loginAttempts || 0}`);
        
        if (admin.lockUntil) {
          console.log(`   ⏰ Locked Until: ${admin.lockUntil.toISOString()}`);
        }
        
        console.log(`   📅 Created: ${admin.createdAt ? admin.createdAt.toISOString() : 'Unknown'}`);
        console.log(`   📅 Updated: ${admin.updatedAt ? admin.updatedAt.toISOString() : 'Unknown'}`);
        console.log(`   📅 Last Login: ${admin.lastLogin ? admin.lastLogin.toISOString() : 'Never'}`);
        
        // Show permissions
        console.log(`   🛡️ Permissions:`);
        if (admin.permissions) {
          Object.entries(admin.permissions).forEach(([key, value]) => {
            console.log(`      - ${key}: ${value ? 'Yes' : 'No'}`);
          });
        } else {
          console.log('      - No permissions set');
        }

        // Test common passwords to find the original password
        console.log(`   🔍 Password Testing:`);
        const adminPasswords = [
          'Admin@123', 'admin123', 'Admin123', 'password', 'Password123',
          'admin', 'administrator', 'root', '123456', 'numbergame'
        ];
        
        let foundAdminPassword = null;
        for (const testPassword of adminPasswords) {
          try {
            const isMatch = await bcrypt.compare(testPassword, admin.passwordHash);
            if (isMatch) {
              foundAdminPassword = testPassword;
              break;
            }
          } catch (error) {
            // Continue testing
          }
        }
        
        if (foundAdminPassword) {
          console.log(`   🔑 Original Password: ${foundAdminPassword}`);
        } else {
          console.log(`   🔑 Original Password: Unable to determine (not in common list)`);
        }
        
        console.log('   ' + '─'.repeat(50));
        console.log('');
      }
    }

    // Summary
    console.log('📊 COMPLETE SUMMARY:');
    console.log('====================');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Admins: ${admins.length}`);
    console.log(`Total Accounts: ${users.length + admins.length}`);
    
    // Active counts
    const activeUsers = users.filter(u => u.isActive).length;
    const activeAdmins = admins.filter(a => a.isActive).length;
    console.log(`Active Users: ${activeUsers}`);
    console.log(`Active Admins: ${activeAdmins}`);
    
    // Users with balance
    const usersWithBalance = users.filter(u => (u.walletBalance || u.wallet || 0) > 0).length;
    console.log(`Users with Wallet Balance: ${usersWithBalance}`);
    
    // Locked admins
    const lockedAdmins = admins.filter(a => a.isLocked).length;
    console.log(`Locked Admins: ${lockedAdmins}`);

    console.log('');
    console.log('🔐 CREDENTIAL SUMMARY:');
    console.log('======================');
    console.log('Known Working Credentials:');
    console.log('');
    
    // Test each admin with Admin@123
    for (const admin of admins) {
      try {
        await Admin.findByCredentials(admin.email, 'Admin@123');
        console.log(`✅ ${admin.email} - Password: Admin@123`);
      } catch (error) {
        console.log(`❌ ${admin.email} - Password: Unknown/Different`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
exportAllData();
