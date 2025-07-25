require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function createAdminAccount() {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = '963sohamraut@gmail.com';
    const adminPassword = 'admin123'; // Plain password - will be hashed by pre-save middleware
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`✅ Admin account (${adminEmail}) already exists`);
      await mongoose.connection.close();
      return;
    }

    // Create new admin (password will be hashed by pre-save middleware)
    const newAdmin = new Admin({
      email: adminEmail,
      passwordHash: adminPassword, // Will be hashed by pre-save middleware
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
      permissions: {
        canManageUsers: true,
        canManageWallets: true,
        canSetResults: true,
        canViewReports: true,
        canManageAdmins: true
      }
    });

    await newAdmin.save();
    console.log(`✅ Admin account created successfully!`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   🔒 Please change the password after first login`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  }
}

createAdminAccount();
