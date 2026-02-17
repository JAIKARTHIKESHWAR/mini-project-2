#!/usr/bin/env node

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Load environment variables FIRST
dotenv.config();

// User Schema for MongoDB
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  firstName: String,
  lastName: String,
  profileImage: String,
  authProvider: { type: String, default: 'google' },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   PORT: ${process.env.PORT || 5000}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`   GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'fragrance-ai-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Setting up Google OAuth strategy...');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔐 Google OAuth Profile:', {
        id: profile.id,
        email: profile.emails[0]?.value,
        name: profile.displayName
      });

      // For now, just return the profile
      return done(null, profile);
    } catch (error) {
      console.error('❌ Google OAuth Error:', error);
      return done(error, null);
    }
  }));

  console.log('✅ Google OAuth strategy configured successfully');
} else {
  console.log('⚠️  Google OAuth credentials not found. Google login will be disabled.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// MongoDB connection - Using fragrance-db database
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    serverApi: {
      version: '1',
      strict: true,
      deprecationErrors: true,
    }
  })
  .then(() => {
    console.log('✅ MongoDB Connected to Atlas');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fragrance AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Google OAuth Routes
app.get('/api/auth/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured'
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      console.log('✅ Google OAuth successful:', req.user);

      const userEmail = req.user.emails[0].value;
      const googleId = req.user.id;

      // Check if user already exists
      let user = await User.findOne({ googleId: googleId });

      if (!user) {
        // Check if user exists with same email but different auth provider
        const existingUser = await User.findOne({ email: userEmail });

        if (existingUser) {
          // User exists but with different auth provider
          console.log('⚠️ User exists with different auth provider');
          const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent('Account already exists with different login method. Please use your original login method.')}`;
          return res.redirect(errorUrl);
        }

        // Create new user
        const userData = {
          googleId: googleId,
          email: userEmail,
          firstName: req.user.name.givenName,
          lastName: req.user.name.familyName,
          profileImage: req.user.photos[0]?.value || '',
          authProvider: 'google',
          lastLogin: new Date(),
          createdAt: new Date(),
          isActive: true,
          accountStatus: 'active'
        };

        user = new User(userData);
        await user.save();
        console.log('✅ New user created in fragrance database');
      } else {
        // Update existing user
        user.lastLogin = new Date();
        await user.save();
        console.log('✅ Existing user updated in fragrance database');
      }

      // Add login history
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'Unknown';
      await user.addLoginHistory(ipAddress, userAgent, 'google');

      console.log('✅ User data stored in fragrance database:', {
        email: userEmail,
        name: `${user.firstName} ${user.lastName}`,
        googleId: googleId
      });

      // Generate JWT token
      const token = user.generateAuthToken();

      // Redirect to dashboard with token
      const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?token=${token}&email=${encodeURIComponent(userEmail)}`;
      res.redirect(dashboardUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent('Authentication failed. Please try again.')}`;
      res.redirect(errorUrl);
    }
  }
);

// API Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Fragrance AI API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      googleAuth: '/api/auth/google',
      googleCallback: '/api/auth/google/callback',
      users: '/api/users',
      userByEmail: '/api/users/:email'
    }
  });
});

// Check if account exists
app.post('/api/auth/check-account', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      res.json({
        success: true,
        exists: true,
        message: 'Account found',
        authProvider: user.authProvider,
        isActive: user.isActive,
        accountStatus: user.accountStatus
      });
    } else {
      res.json({
        success: true,
        exists: false,
        message: 'Account not found. Please sign up to create a new account.',
        trending: true
      });
    }
  } catch (error) {
    console.error('Check account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking account'
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-__v');
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get user by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/auth/google`);
});
