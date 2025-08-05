const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/number-game', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestUser = async () => {
  await connectDB();
  
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Username: testuser');
      console.log('Password: testpass123');
      console.log('User ID:', existingUser._id);
      console.log('Wallet Balance:', existingUser.walletBalance);
      process.exit(0);
    }
    
    // Hash password
    // Note: Don't manually hash here, let the User model's pre-save hook handle it
    
    // Create test user
    const testUser = new User({
      username: 'testuser',
      mobileNumber: '9876543210', // Valid Indian mobile number
      email: 'test@example.com',
      passwordHash: 'testpass123', // Use plain password, model will hash it
      walletBalance: 1000, // Give test user 1000 tokens
      isActive: true
    });
    
    await testUser.save();
    
    console.log('✅ Test user created successfully!');
    console.log('Username: testuser');
    console.log('Password: testpass123');
    console.log('Mobile: 9876543210');
    console.log('Email: test@example.com');
    console.log('Wallet Balance: 1000');
    console.log('User ID:', testUser._id);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestUser();
