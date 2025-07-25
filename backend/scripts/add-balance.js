require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function addWalletBalance() {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/numbergame';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all users and add balance
    const users = await User.find({});
    
    for (const user of users) {
      if (user.walletBalance < 100) {
        user.walletBalance = 1000; // Give 1000 balance for testing
        await user.save();
        console.log(`✅ Added balance to user: ${user.email} - New balance: ${user.walletBalance}`);
      } else {
        console.log(`✅ User ${user.email} already has sufficient balance: ${user.walletBalance}`);
      }
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error adding wallet balance:', error);
    process.exit(1);
  }
}

addWalletBalance();
