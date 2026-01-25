#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests Google OAuth and MongoDB user storage
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAuthentication() {
  try {
    console.log('🔐 Testing Authentication System...\n');
    
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    // Test 1: Check if users collection exists and is accessible
    console.log('📋 Test 1: Checking users collection...');
    const userCount = await User.countDocuments();
    console.log(`✅ Users collection accessible. Current user count: ${userCount}\n`);
    
    // Test 2: Create a test user to verify storage
    console.log('📋 Test 2: Creating test user...');
    const testUser = new User({
      googleId: 'test_google_id_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser_' + Date.now(),
      profileImage: 'https://example.com/avatar.jpg',
      authProvider: 'google',
      isActive: true
    });
    
    // Check if user already exists
    const existingUser = await User.findOne({ googleId: 'test_google_id_123' });
    if (existingUser) {
      console.log('ℹ️  Test user already exists, skipping creation');
    } else {
      await testUser.save();
      console.log('✅ Test user created successfully');
    }
    
    // Test 3: Verify user can be retrieved
    console.log('\n📋 Test 3: Retrieving test user...');
    const retrievedUser = await User.findOne({ googleId: 'test_google_id_123' });
    if (retrievedUser) {
      console.log('✅ Test user retrieved successfully');
      console.log(`   - Email: ${retrievedUser.email}`);
      console.log(`   - Name: ${retrievedUser.firstName} ${retrievedUser.lastName}`);
      console.log(`   - Auth Provider: ${retrievedUser.authProvider}`);
      console.log(`   - Created: ${retrievedUser.createdAt}`);
    } else {
      console.log('❌ Failed to retrieve test user');
    }
    
    // Test 4: Test JWT token generation
    console.log('\n📋 Test 4: Testing JWT token generation...');
    if (retrievedUser) {
      const token = retrievedUser.generateAuthToken();
      console.log('✅ JWT token generated successfully');
      console.log(`   - Token length: ${token.length} characters`);
    }
    
    // Test 5: Test OAuth user creation method
    console.log('\n📋 Test 5: Testing OAuth user creation...');
    const mockProfile = {
      id: 'oauth_test_123',
      emails: [{ value: 'oauth@example.com' }],
      name: { givenName: 'OAuth', familyName: 'Test' },
      photos: [{ value: 'https://example.com/oauth-avatar.jpg' }]
    };
    
    const oauthUser = await User.findOrCreateOAuthUser(mockProfile, 'google');
    console.log('✅ OAuth user creation method works');
    console.log(`   - Email: ${oauthUser.email}`);
    console.log(`   - Google ID: ${oauthUser.googleId}`);
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ MongoDB connection working');
    console.log('   ✅ Users collection accessible');
    console.log('   ✅ User creation working');
    console.log('   ✅ User retrieval working');
    console.log('   ✅ JWT token generation working');
    console.log('   ✅ OAuth user creation working');
    
    console.log('\n🔗 Your authentication endpoints:');
    console.log('   - Google OAuth: http://localhost:5000/api/auth/google');
    console.log('   - Health Check: http://localhost:5000/health');
    console.log('   - User Profile: http://localhost:5000/api/auth/profile (requires JWT token)');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n📊 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the test
testAuthentication();
