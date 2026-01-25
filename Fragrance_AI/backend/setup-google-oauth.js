#!/usr/bin/env node

/**
 * Google OAuth Setup Helper
 * This script helps you set up Google OAuth credentials
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Google OAuth Setup Helper');
console.log('============================\n');

console.log('📋 Step-by-Step Instructions:');
console.log('1. Go to: https://console.cloud.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Enable Google+ API:');
console.log('   - Go to "APIs & Services" → "Library"');
console.log('   - Search for "Google+ API" and enable it');
console.log('4. Create OAuth 2.0 Credentials:');
console.log('   - Go to "APIs & Services" → "Credentials"');
console.log('   - Click "Create Credentials" → "OAuth 2.0 Client IDs"');
console.log('   - Choose "Web application"');
console.log('   - Name: "Fragrance AI Web Client"');
console.log('   - Authorized JavaScript origins: http://localhost:5173');
console.log('   - Authorized redirect URIs: http://localhost:5000/api/auth/google/callback');
console.log('   - Click "Create" and copy the credentials\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupCredentials() {
  try {
    const clientId = await askQuestion('Enter your Google Client ID: ');
    const clientSecret = await askQuestion('Enter your Google Client Secret: ');
    
  if (!clientId || !clientSecret || clientId === 'your_google_client_id_here' || clientSecret === 'your_google_client_secret_here') {
    console.log('❌ Invalid credentials provided. Please get your credentials from Google Cloud Console.');
    rl.close();
    return;
  }

  // Read current .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    console.log('❌ .env file not found. Please create one first.');
    rl.close();
    return;
  }

  // Update Google OAuth credentials
  envContent = envContent.replace(
    'GOOGLE_CLIENT_ID=your_google_client_id_here',
    `GOOGLE_CLIENT_ID=${clientId}`
  );
  envContent = envContent.replace(
    'GOOGLE_CLIENT_SECRET=your_google_client_secret_here',
    `GOOGLE_CLIENT_SECRET=${clientSecret}`
  );

  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Google OAuth credentials updated successfully!');
  console.log('🚀 You can now start your server with: npm run start');
  console.log('🔗 Test Google OAuth at: http://localhost:5000/api/auth/google');
  
  } catch (error) {
    console.error('❌ Error setting up credentials:', error.message);
  } finally {
    rl.close();
  }
}

setupCredentials();
