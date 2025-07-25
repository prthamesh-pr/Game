/**
 * Create a test admin user for API testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function createTestAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Remove existing test admin
    await Admin.deleteOne({ email: '963sohamraut@gmail.com' });
    console.log('🗑️  Removed existing admin');

    // Create new admin with the requested email
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    
    const admin = new Admin({
      email: '963sohamraut@gmail.com',
      passwordHash: adminPassword,
      fullName: 'Soham Raut',
      role: 'super-admin',
      permissions: {
        canManageUsers: true,
        canManageWallets: true,
        canSetResults: true,
        canViewReports: true,
        canManageAdmins: true
      }
    });

    await admin.save();
    console.log('✅ Test admin created successfully');
    console.log('📧 Email: 963sohamraut@gmail.com');
    console.log('🔑 Password: Admin@123');

    // Test login
    const testAdmin = await Admin.findByCredentials('963sohamraut@gmail.com', 'Admin@123');
    console.log('✅ Admin login test successful');
    console.log('👤 Admin ID:', testAdmin._id);
    console.log('👤 Admin Name:', testAdmin.fullName);

  } catch (error) {
    console.error('❌ Error creating test admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

// Run only if called directly
if (require.main === module) {
  createTestAdmin();
}

module.exports = createTestAdmin;
