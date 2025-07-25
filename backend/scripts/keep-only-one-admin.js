// Script to remove all admins and users, then add new admin Soham Raut
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Remove all admins
    const adminDel = await Admin.deleteMany({});
    console.log(`🗑️  Deleted ${adminDel.deletedCount} admins.`);

    // Remove all users
    const userDel = await User.deleteMany({});
    console.log(`🗑️  Deleted ${userDel.deletedCount} users.`);

    // Add new admin Soham Raut
    const password = 'KiranM@123';
    const passwordHash = await bcrypt.hash(password, 12);
    const sohamAdmin = new Admin({
      email: '963sohamraut@gmail.com',
      passwordHash,
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
    console.log('✅ Added new admin: Soham Raut (963sohamraut@gmail.com)');

    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

run();
