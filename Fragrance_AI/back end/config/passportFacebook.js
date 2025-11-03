import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables - use same path logic as server.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Facebook OAuth Strategy Configuration
 * Handles Facebook Sign-In authentication flow
 */
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.BASE_URL ? `${process.env.BASE_URL}/api/auth/facebook/callback` : 'http://localhost:5000/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Facebook OAuth Profile:', {
      id: profile.id,
      email: profile.emails[0]?.value,
      name: profile.displayName
    });

    // Find or create user using the static method
    const user = await User.findOrCreateOAuthUser(profile, 'facebook');
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return done(null, user);
  } catch (error) {
    console.error('Facebook OAuth Error:', error);
    return done(error, null);
  }
  }));
} else {
  console.log('⚠️  Facebook OAuth credentials not found. Facebook login will be disabled.');
}

export default passport;