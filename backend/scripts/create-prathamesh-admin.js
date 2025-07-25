/**
 * Create New Admin Script
 * Creates a new admin with 963prathamesh@gmail.com and resets any locked accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function createNewAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Reset all admin lock states first
    await Admin.updateMany(
      {},
      {
        $unset: { lockUntil: 1 },
        $set: { 
          isLocked: false,
          loginAttempts: 0
        }
      }
    );
    console.log('🔓 Reset all admin lock states');

    // Remove existing admin with the new email if exists
    await Admin.deleteOne({ email: '963prathamesh@gmail.com' });
    console.log('🗑️  Removed existing admin with email 963prathamesh@gmail.com');

    // Create new admin with the requested email
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    
    const admin = new Admin({
      email: '963prathamesh@gmail.com',
      passwordHash: adminPassword,
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
      isLocked: false,
      loginAttempts: 0
    });

    await admin.save();
    console.log('✅ New admin created successfully');
    console.log('📧 Email: 963prathamesh@gmail.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Full Name: Prathamesh Raut');
    console.log('🔑 Role: super-admin');

    // Test login to verify it works
    try {
      const testAdmin = await Admin.findByCredentials('963prathamesh@gmail.com', 'Admin@123');
      console.log('✅ Admin login test successful');
      console.log('👤 Admin ID:', testAdmin._id);
      console.log('👤 Admin Name:', testAdmin.fullName);
      console.log('');
      
      // Also test the old admin account
      try {
        const oldAdmin = await Admin.findByCredentials('963sohamraut@gmail.com', 'Admin@123');
        console.log('✅ Old admin account (963sohamraut@gmail.com) is also working');
        console.log('👤 Admin ID:', oldAdmin._id);
      } catch (oldError) {
        console.log('❌ Old admin account still has issues:', oldError.message);
      }
      
    } catch (error) {
      console.error('❌ Admin login test failed:', error.message);
    }

    // List all admins
    const allAdmins = await Admin.find({}, { passwordHash: 0, __v: 0 });
    console.log('\n👨‍💼 ALL ADMINS AFTER UPDATE:');
    console.log('=============================');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.fullName} (${admin.email})`);
      console.log(`   🔑 Role: ${admin.role}`);
      console.log(`   🔐 Active: ${admin.isActive ? 'Yes' : 'No'}`);
      console.log(`   🚫 Locked: ${admin.isLocked ? 'Yes' : 'No'}`);
      console.log(`   🔢 Login Attempts: ${admin.loginAttempts || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   (Email already exists - this admin was already created)');
    }
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run the script
createNewAdmin();
