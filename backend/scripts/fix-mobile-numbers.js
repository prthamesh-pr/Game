/**
 * Script to fix the duplicate null mobile number issue
 * This script removes the mobileNumber field from users where it's null
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixMobileNumbers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {});
    
    console.log('Connected to MongoDB database');
    
    // Find users with null mobile numbers
    const usersWithNullMobile = await User.find({
      mobileNumber: null
    });
    
    console.log(`Found ${usersWithNullMobile.length} users with null mobile numbers`);
    
    // Update all users with null mobile numbers
    const updateResult = await User.updateMany(
      { mobileNumber: null },
      { $unset: { mobileNumber: 1 } }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} users`);
    
    // Verify the update
    const remainingNullMobiles = await User.countDocuments({ mobileNumber: null });
    console.log(`Remaining users with null mobile numbers: ${remainingNullMobiles}`);
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing mobile numbers:', error);
    process.exit(1);
  }
}

fixMobileNumbers();
