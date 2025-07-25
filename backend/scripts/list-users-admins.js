/**
 * List All Users and Admins Script
 * Displays all users and admins in the database without password hashes
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function listAllUsersAndAdmins() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Get all users
    const users = await User.find({}, {
      passwordHash: 0, // Exclude password hash
      __v: 0
    }).sort({ createdAt: -1 });

    console.log('👥 USERS LIST:');
    console.log('==============');
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email})`);
        console.log(`   📱 Mobile: ${user.mobileNumber || 'Not provided'}`);
        console.log(`   💰 Balance: ${user.walletBalance || user.wallet || 0}`);
        console.log(`   🎮 Games Played: ${user.gamesPlayed || 0}`);
        console.log(`   🏆 Winnings: ${user.totalWinnings || 0}`);
        console.log(`   📅 Created: ${user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'Unknown'}`);
        console.log(`   🔐 Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

    // Get all admins
    const admins = await Admin.find({}, {
      passwordHash: 0, // Exclude password hash
      __v: 0
    }).sort({ createdAt: -1 });

    console.log('👨‍💼 ADMINS LIST:');
    console.log('===============');
    if (admins.length === 0) {
      console.log('No admins found');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.fullName || 'Unnamed Admin'} (${admin.email})`);
        console.log(`   🔑 Role: ${admin.role}`);
        console.log(`   🛡️ Permissions:`);
        if (admin.permissions) {
          Object.entries(admin.permissions).forEach(([key, value]) => {
            console.log(`      - ${key}: ${value ? 'Yes' : 'No'}`);
          });
        }
        console.log(`   📅 Created: ${admin.createdAt ? admin.createdAt.toISOString().split('T')[0] : 'Unknown'}`);
        console.log(`   🔐 Active: ${admin.isActive ? 'Yes' : 'No'}`);
        console.log(`   🚫 Locked: ${admin.isLocked ? 'Yes' : 'No'}`);
        if (admin.lockUntil) {
          console.log(`   ⏰ Lock Until: ${admin.lockUntil.toISOString()}`);
        }
        console.log(`   🔢 Login Attempts: ${admin.loginAttempts || 0}`);
        console.log('');
      });
    }

    console.log('📊 SUMMARY:');
    console.log('===========');
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Admins: ${admins.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
listAllUsersAndAdmins();
