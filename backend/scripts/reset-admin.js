require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function resetAdminAccount() {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Reset admin login attempts and unlock account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@numbergame.com';
    
    const result = await Admin.updateOne(
      { email: adminEmail },
      {
        $unset: {
          loginAttempts: 1,
          lockUntil: 1
        }
      }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Admin account (${adminEmail}) has been unlocked and login attempts reset`);
    } else {
      console.log(`❌ Admin account (${adminEmail}) not found`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error resetting admin account:', error);
    process.exit(1);
  }
}

resetAdminAccount();
