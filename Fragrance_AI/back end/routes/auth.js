import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import '../config/passportGoogle.js';
import '../config/passportFacebook.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, birthdate, timeZone } = req.body;

    // Generate username if not provided
    const generatedUsername = username || (email?.split('@')[0] + '_' + Date.now());

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: generatedUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({
      username: generatedUsername,
      email,
      password,
      firstName,
      lastName,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      timeZone: timeZone || 'UTC'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthdate: user.birthdate,
        timeZone: user.timeZone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password incorrect'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        birthdate: user.birthdate,
        timeZone: user.timeZone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('wishlist', 'name brand imageUrl price')
      .populate('favorites', 'name brand imageUrl price')
      .populate('customBlends', 'name description notes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        preferences: user.preferences,
        fragranceProfile: user.fragranceProfile,
        wishlist: user.wishlist,
        favorites: user.favorites,
        customBlends: user.customBlends,
        aiInsights: user.aiInsights
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, preferences, fragranceProfile } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (fragranceProfile) user.fragranceProfile = { ...user.fragranceProfile, ...fragranceProfile };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences,
        fragranceProfile: user.fragranceProfile
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
});

// ==================== OAUTH ROUTES ====================

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured'
    });
  }
  // Store the source (signup or login) in the session state
  const state = Buffer.from(JSON.stringify({ 
    source: req.query.source || 'signup' // 'signup' or 'login'
  })).toString('base64');
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state
  })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/auth/error' }),
  async (req, res) => {
    try {
      const email = req.user.email;
      const googleId = req.user.googleId;
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { googleId: googleId },
          { email: email }
        ]
      });
      
      // Parse state to check if this is from signup or login
      const state = req.query.state;
      let isFromSignup = false;
      if (state) {
        try {
          const parsedState = JSON.parse(Buffer.from(state, 'base64').toString());
          isFromSignup = parsedState.source === 'signup';
        } catch (e) {
          // Default to checking user existence
          isFromSignup = !existingUser;
        }
      } else {
        // If no state, check if user exists
        isFromSignup = !existingUser;
      }
      
      if (existingUser) {
        // User exists, generate token and redirect to dashboard
        const token = existingUser.generateAuthToken();
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = `${frontendBase}/dashboard?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
        res.redirect(redirectUrl);
      } else if (isFromSignup) {
        // New user from signup, redirect to signup form or ask for additional info
        // For now, just create user and redirect
        const newUser = await User.findOrCreateOAuthUser(req.user, 'google');
        const token = newUser.generateAuthToken();
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = `${frontendBase}/dashboard?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
        res.redirect(redirectUrl);
      } else {
        // User doesn't exist and this is from login
        const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent('Account not found. Please sign up first.')}`;
        res.redirect(errorUrl);
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent('Authentication failed')}`;
      res.redirect(errorUrl);
    }
  }
);

// Facebook OAuth Routes
router.get('/facebook', (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Facebook OAuth is not configured'
    });
  }
  passport.authenticate('facebook', {
    scope: ['email']
  })(req, res, next);
});

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = req.user.generateAuthToken();
      
      // Redirect to frontend with token
      const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}`;
      res.redirect(frontendUrl);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent('Authentication failed')}`;
      res.redirect(errorUrl);
    }
  }
);

// Check if account exists
router.post('/check-account', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.json({
      success: true,
      exists: !!user
    });
  } catch (error) {
    console.error('Account check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account check',
      error: error.message
    });
  }
});

// ==================== UTILITY ROUTES ====================

// Verify token endpoint
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// ==================== MIDDLEWARE ====================

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

export default router;
