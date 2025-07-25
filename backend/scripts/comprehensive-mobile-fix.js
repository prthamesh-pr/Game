/**
 * Comprehensive script to fix mobile number issues and rebuild indexes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function comprehensiveFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log('Connected to MongoDB database');
    
    // Step 1: Remove all null mobile number fields
    console.log('Step 1: Removing null mobile number fields...');
    const updateResult = await User.updateMany(
      { $or: [{ mobileNumber: null }, { mobileNumber: "" }] },
      { $unset: { mobileNumber: 1 } }
    );
    console.log(`Removed mobile number field from ${updateResult.modifiedCount} users`);
    
    // Step 2: Drop the existing index on mobileNumber
    console.log('Step 2: Dropping existing mobileNumber index...');
    try {
      await User.collection.dropIndex({ mobileNumber: 1 });
      console.log('Dropped existing mobileNumber index');
    } catch (error) {
      console.log('No existing mobileNumber index to drop or error:', error.message);
    }
    
    // Step 3: Recreate the index with proper sparse and unique settings
    console.log('Step 3: Creating new sparse unique index on mobileNumber...');
    await User.collection.createIndex(
      { mobileNumber: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('Created new sparse unique index on mobileNumber');
    
    // Step 4: Verify no duplicate mobile numbers exist
    console.log('Step 4: Checking for duplicate mobile numbers...');
    const duplicates = await User.aggregate([
      { $match: { mobileNumber: { $exists: true, $ne: null } } },
      { $group: { _id: "$mobileNumber", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate mobile numbers:`, duplicates);
    } else {
      console.log('No duplicate mobile numbers found');
    }
    
    // Step 5: Final verification
    const totalUsers = await User.countDocuments();
    const usersWithMobile = await User.countDocuments({ mobileNumber: { $exists: true } });
    const usersWithNullMobile = await User.countDocuments({ mobileNumber: null });
    
    console.log(`\nFinal stats:`);
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with mobile numbers: ${usersWithMobile}`);
    console.log(`Users with null mobile numbers: ${usersWithNullMobile}`);
    
    console.log('\nComprehensive fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during comprehensive fix:', error);
    process.exit(1);
  }
}

comprehensiveFix();
