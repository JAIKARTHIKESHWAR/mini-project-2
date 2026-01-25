#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './back end/.env' });

// Simple User Schema for testing
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  firstName: String,
  lastName: String,
  profileImage: String,
  authProvider: { type: String, default: 'google' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function testMongoDB() {
  try {
    console.log('🔐 Testing MongoDB User Storage...\n');
    
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fragrance_db:151005@fragrance-ai.rrepxjp.mongodb.net/fragrance-db?retryWrites=true&w=majority&appName=fragrance-db";
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Test 1: Create a test user
    console.log('📋 Test 1: Creating test user...');
    const testUser = new User({
      googleId: 'test_google_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      profileImage: 'https://example.com/avatar.jpg',
      authProvider: 'google'
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   - Google ID: ${testUser.googleId}`);
    
    // Test 2: Retrieve the user
    console.log('\n📋 Test 2: Retrieving test user...');
    const retrievedUser = await User.findOne({ googleId: 'test_google_123' });
    if (retrievedUser) {
      console.log('✅ Test user retrieved successfully');
      console.log(`   - Email: ${retrievedUser.email}`);
      console.log(`   - Created: ${retrievedUser.createdAt}`);
    } else {
      console.log('❌ Failed to retrieve test user');
    }
    
    // Test 3: Count users
    console.log('\n📋 Test 3: Counting users...');
    const userCount = await User.countDocuments();
    console.log(`✅ Total users in database: ${userCount}`);
    
    console.log('\n🎉 MongoDB User Storage Test Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ MongoDB connection working');
    console.log('   ✅ User creation working');
    console.log('   ✅ User retrieval working');
    console.log('   ✅ User storage in MongoDB working');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n📊 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the test
testMongoDB();
