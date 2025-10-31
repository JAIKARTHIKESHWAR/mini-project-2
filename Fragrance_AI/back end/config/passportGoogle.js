import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

/**
 * Google OAuth 2.0 Strategy Configuration
 * Handles Google Sign-In authentication flow
 */
// Check if we have valid Google OAuth credentials
const hasValidGoogleCredentials = process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET && 
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' && 
  process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here' &&
  process.env.GOOGLE_CLIENT_ID.length > 10 &&
  process.env.GOOGLE_CLIENT_SECRET.length > 10;

console.log('🔍 Google OAuth Debug:', {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
  clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length,
  hasValidCredentials: hasValidGoogleCredentials,
  actualClientId: process.env.GOOGLE_CLIENT_ID,
  actualClientSecret: process.env.GOOGLE_CLIENT_SECRET
});

if (hasValidGoogleCredentials) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BASE_URL ? `${process.env.BASE_URL}/api/auth/google/callback` : 'http://localhost:5000/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔐 Google OAuth Profile:', {
        id: profile.id,
        email: profile.emails[0]?.value,
        name: profile.displayName
      });

      // Find or create user using the static method
      const user = await User.findOrCreateOAuthUser(profile, 'google');
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();

      console.log('✅ Google OAuth user authenticated:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth Error:', error);
      return done(error, null);
    }
  }));
  
  console.log('✅ Google OAuth strategy configured successfully');
} else {
  console.log('⚠️  Google OAuth credentials not found. Google login will be disabled.');
  console.log('   Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
  console.log('   Current values:', {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'
  });
}

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;