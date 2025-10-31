import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

/**
 * Test script to verify authentication setup
 */
async function testAuthSetup() {
  console.log('🧪 Testing Authentication Setup...\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables:');
  const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'JWT_SECRET',
    'SESSION_SECRET',
    'MONGO_URI',
    'FRONTEND_URL'
  ];

  let envVarsOk = true;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== `your_${varName.toLowerCase()}_here`) {
      console.log(`   ✅ ${varName}: Set`);
    } else {
      console.log(`   ❌ ${varName}: Not set or using placeholder`);
      envVarsOk = false;
    }
  });

  if (!envVarsOk) {
    console.log('\n❌ Environment variables not properly configured!');
    console.log('   Please update your .env file with actual values.');
    return;
  }

  // Test 2: Database Connection
  console.log('\n2️⃣ Testing Database Connection:');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ MongoDB connection successful');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`   ✅ User model working (${userCount} users in database)`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    return;
  }

  // Test 3: OAuth URLs
  console.log('\n3️⃣ Testing OAuth Configuration:');
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  console.log(`   Backend URL: ${baseUrl}`);
  console.log(`   Frontend URL: ${frontendUrl}`);
  console.log(`   Google OAuth URL: ${baseUrl}/api/auth/google`);
  console.log(`   Google Callback URL: ${baseUrl}/api/auth/google/callback`);

  // Test 4: Google OAuth Credentials Format
  console.log('\n4️⃣ Testing Google OAuth Credentials:');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (clientId && clientId.includes('googleusercontent.com')) {
    console.log('   ✅ Google Client ID format looks correct');
  } else {
    console.log('   ⚠️  Google Client ID format may be incorrect');
  }
  
  if (clientSecret && clientSecret.length > 20) {
    console.log('   ✅ Google Client Secret format looks correct');
  } else {
    console.log('   ⚠️  Google Client Secret format may be incorrect');
  }

  // Test 5: JWT Secret
  console.log('\n5️⃣ Testing JWT Configuration:');
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length > 20) {
    console.log('   ✅ JWT Secret is set and looks secure');
  } else {
    console.log('   ⚠️  JWT Secret may be too short or not set');
  }

  console.log('\n🎉 Authentication setup test completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Start your backend server: npm run dev');
  console.log('   2. Test the health endpoint: http://localhost:5000/health');
  console.log('   3. Test Google OAuth: http://localhost:5000/api/auth/google');
  console.log('   4. Start your frontend and test the login flow');
  
  console.log('\n🔧 If you see any ❌ or ⚠️  warnings above, please fix them before testing.');
}

// Run the test
testAuthSetup().catch(console.error);
