import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import '../config/passportGoogle.js';
import '../config/passportFacebook.js';

const router = express.Router();

// Helper function to generate Gravatar URL from email
const getGravatarUrl = (email) => {
  if (!email) return '';
  const emailHash = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex');
  return `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=200`;
};

// Cookie configuration for HTTP-only cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

// Access token expires in 15 minutes
const ACCESS_TOKEN_EXPIRE = '15m';
// Refresh token expires in 7 days
const REFRESH_TOKEN_EXPIRE = '7d';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, birthdate, timeZone } = req.body;

    // Server-side validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Validate password length (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Generate username if not provided
    const generatedUsername = username || (email?.split('@')[0] + '_' + Date.now());

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: generatedUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Validate JWT_SECRET before proceeding
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set'
      });
    }

    // Generate email verification token (expires in 10 minutes)
    const verificationToken = jwt.sign(
      { 
        userId: null, // Will be set after user creation
        email: email.toLowerCase(),
        type: 'email_verification'
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // 10 minutes expiration
    );

    // Create new user with isVerified: false
    const user = new User({
      username: generatedUsername,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      timeZone: timeZone || 'UTC',
      isVerified: false, // User must verify email before login
      verificationToken: verificationToken,
      verificationTokenExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    await user.save();

    // Update verification token with actual userId
    const finalVerificationToken = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        type: 'email_verification'
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Update user with final token
    user.verificationToken = finalVerificationToken;
    await user.save();

    // Send verification email
    try {
      console.log(`📧 Attempting to send verification email to: ${user.email}`);
      await sendVerificationEmail(
        user.email, 
        finalVerificationToken, 
        firstName || user.username
      );
      console.log(`✅ Verification email sent successfully to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails - user can request resend later
      // But log it for admin attention
    }

    // Don't return auth token - user must verify email first
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      },
      // Don't include token - user needs to verify email first
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

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

    // Server-side validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please sign up first.'
      });
    }

    // If this account was created via OAuth, it won't have a local password
    if (user.authProvider && user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'This account was created with ' + user.authProvider + '. Please use "Continue with ' + (user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1)) + '" to sign in.'
      });
    }

    // If no password set, block local login gracefully
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password login is not available for this account. Please reset your password or use social login.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    // Check if email is verified (for local auth users)
    if (user.authProvider === 'local' && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Validate JWT_SECRET before signing
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set'
      });
    }

    // Generate access token (15 minutes)
    const accessToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRE }
    );

    // Hash refresh token for storage
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';

    // Create session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    try {
      // First, revoke any existing sessions with the same refresh token hash (if any)
      await Session.updateMany(
        { refreshTokenHash, isRevoked: false },
        { isRevoked: true, updatedAt: new Date() }
      );

      // Create new session
      const session = await Session.create({
        userId: user._id,
        refreshTokenHash,
        expiresAt,
        ipAddress,
        userAgent
      });
      
      console.log('✅ Session created in database:', {
        sessionId: session._id.toString(),
        userId: user._id.toString(),
        refreshTokenHash: refreshTokenHash.substring(0, 16) + '...',
        expiresAt: session.expiresAt,
        ipAddress: ipAddress,
        userAgent: userAgent?.substring(0, 50) || 'N/A'
      });
    } catch (sessionError) {
      console.error('❌ Error creating session:', {
        error: sessionError.message,
        code: sessionError.code,
        name: sessionError.name,
        stack: sessionError.stack
      });
      
      // If it's a duplicate key error, try to update existing session instead
      if (sessionError.code === 11000 || sessionError.message.includes('duplicate')) {
        try {
          const existingSession = await Session.findOneAndUpdate(
            { refreshTokenHash },
            {
              userId: user._id,
              expiresAt,
              ipAddress,
              userAgent,
              isRevoked: false,
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
          console.log('✅ Session updated/created via upsert:', {
            sessionId: existingSession._id.toString(),
            userId: user._id.toString()
          });
        } catch (upsertError) {
          console.error('❌ Error upserting session:', upsertError);
        }
      }
      // Don't fail login if session creation fails, but log it
      // Session is important but shouldn't block authentication
    }

    // Get profile image: use OAuth image if available, otherwise Gravatar for local users
    let profileImage = user.profileImage;
    if (!profileImage && user.authProvider === 'local' && user.email) {
      profileImage = getGravatarUrl(user.email);
    }

    // Set cookies and return user data
    res
      .cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: profileImage,
          authProvider: user.authProvider,
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

    // Get profile image: use OAuth image if available, otherwise Gravatar for local users
    let profileImage = user.profileImage;
    if (!profileImage && user.authProvider === 'local' && user.email) {
      profileImage = getGravatarUrl(user.email);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: profileImage,
        authProvider: user.authProvider,
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
    const { username, firstName, lastName, preferences, fragranceProfile } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update username if provided
    if (username !== undefined && username !== null && username !== '') {
      // Validate username
      const trimmedUsername = username.trim();
      
      if (trimmedUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long'
        });
      }
      
      if (trimmedUsername.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Username must be less than 100 characters'
        });
      }

      // Check if username is already taken by another user
      const existingUser = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }

      console.log(`🔄 Updating username for user ${user._id}: "${user.username}" -> "${trimmedUsername}"`);
      user.username = trimmedUsername;
    }

    // Update other fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (fragranceProfile) user.fragranceProfile = { ...user.fragranceProfile, ...fragranceProfile };

    // Save user with validation
    let savedUser;
    try {
      savedUser = await user.save();
      console.log(`✅ User profile updated successfully. Username: "${savedUser.username}"`);
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      
      // Handle duplicate key error (MongoDB unique constraint)
      if (saveError.code === 11000 || saveError.message.includes('duplicate')) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
      
      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors
        });
      }
      
      throw saveError; // Re-throw if it's not a handled error
    }

    // Reload user from database to ensure we have the latest data
    const updatedUser = await User.findById(savedUser._id);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found after update'
      });
    }

    // Get profile image: use OAuth image if available, otherwise Gravatar for local users
    let profileImage = updatedUser.profileImage;
    if (!profileImage && updatedUser.authProvider === 'local' && updatedUser.email) {
      profileImage = getGravatarUrl(updatedUser.email);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profileImage: profileImage,
        authProvider: updatedUser.authProvider,
        preferences: updatedUser.preferences,
        fragranceProfile: updatedUser.fragranceProfile
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000 || error.message.includes('duplicate')) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
});

// Change password endpoint (for manual users only)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Find user with password field
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a manual user (has password)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password change is not available for OAuth accounts'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password (User model will hash it automatically via pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password changed successfully for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
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
    state: state,
    prompt: 'select_account' // Force account selection (Google-like behavior)
  })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/auth/error' }),
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      // Ensure JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const email = req.user.email;
      const googleId = req.user.googleId;
      
      // Parse state to check if this is from signup or login
      const state = req.query.state;
      let isFromSignup = false;
      if (state) {
        try {
          const parsedState = JSON.parse(Buffer.from(state, 'base64').toString());
          isFromSignup = parsedState.source === 'signup';
        } catch (e) {
          console.error('Error parsing state:', e);
        }
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { googleId: googleId },
          { email: email.toLowerCase() }
        ]
      });

      let user = existingUser;
      
      if (!existingUser) {
        if (!isFromSignup) {
        // User doesn't exist and this is from login
        const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent('Account not found. Please sign up first.')}`;
          return res.redirect(errorUrl);
        }
        // Create new user from signup
        user = await User.findOrCreateOAuthUser(req.user, 'google');
      } else {
        // User exists
        if (isFromSignup) {
          // Account already exists - redirect to login (Google-like behavior)
          const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
          const loginUrl = `${frontendBase}/?showLogin=true&message=${encodeURIComponent('Account already exists. Please sign in.')}`;
          console.log('⚠️  Google OAuth: Account exists, redirecting to login:', loginUrl);
          return res.redirect(loginUrl);
        }
        
        // Update OAuth ID if not set
        if (!existingUser.googleId) {
          existingUser.googleId = googleId;
          existingUser.authProvider = 'google';
          await existingUser.save();
        }
        // Update last login
        existingUser.lastLogin = new Date();
        await existingUser.save();
      }
      
      // Generate access token (15 minutes)
      const accessToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRE }
      );

      // Generate refresh token (7 days)
      const refreshToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRE }
      );

      // Hash refresh token for storage
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Get IP address and user agent
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent') || '';

      // Create session in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      try {
        // First, revoke any existing sessions with the same refresh token hash (if any)
        await Session.updateMany(
          { refreshTokenHash, isRevoked: false },
          { isRevoked: true, updatedAt: new Date() }
        );

        // Create new session
        const session = await Session.create({
          userId: user._id,
          refreshTokenHash,
          expiresAt,
          ipAddress,
          userAgent
        });
        
        console.log('✅ Session created in database (Google OAuth):', {
          sessionId: session._id.toString(),
          userId: user._id.toString(),
          refreshTokenHash: refreshTokenHash.substring(0, 16) + '...',
          expiresAt: session.expiresAt
        });
      } catch (sessionError) {
        console.error('❌ Error creating session (Google OAuth):', {
          error: sessionError.message,
          code: sessionError.code,
          name: sessionError.name
        });
        
        // If it's a duplicate key error, try to update existing session instead
        if (sessionError.code === 11000 || sessionError.message.includes('duplicate')) {
          try {
            const existingSession = await Session.findOneAndUpdate(
              { refreshTokenHash },
              {
                userId: user._id,
                expiresAt,
                ipAddress,
                userAgent,
                isRevoked: false,
                updatedAt: new Date()
              },
              { upsert: true, new: true }
            );
            console.log('✅ Session updated/created via upsert (Google OAuth):', {
              sessionId: existingSession._id.toString(),
              userId: user._id.toString()
            });
          } catch (upsertError) {
            console.error('❌ Error upserting session (Google OAuth):', upsertError);
          }
        }
      }

      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // If from signup and new account created, redirect to login (Google-style)
      if (isFromSignup && !existingUser) {
        const loginUrl = `${frontendBase}/?showLogin=true&message=${encodeURIComponent('Account created! Please sign in.')}`;
        console.log('✅ Google OAuth: New account created, redirecting to login:', loginUrl);
        return res.redirect(loginUrl);
      }
      
      // Otherwise, proceed with normal login flow (set cookies and redirect to dashboard)
      res
        .cookie('accessToken', accessToken, {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000, // 15 minutes
        })
        .cookie('refreshToken', refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .redirect(`${frontendBase}/dashboard`);
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      const errorMessage = error.message || 'Authentication failed';
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent(errorMessage)}`;
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
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = req.user;

      // Generate access token (15 minutes)
      const accessToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRE }
      );

      // Generate refresh token (7 days)
      const refreshToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRE }
      );

      // Hash refresh token for storage
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Get IP address and user agent
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent') || '';

      // Create session in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      try {
        // First, revoke any existing sessions with the same refresh token hash (if any)
        await Session.updateMany(
          { refreshTokenHash, isRevoked: false },
          { isRevoked: true, updatedAt: new Date() }
        );

        // Create new session
        const session = await Session.create({
          userId: user._id,
          refreshTokenHash,
          expiresAt,
          ipAddress,
          userAgent
        });
        
        console.log('✅ Session created in database (Facebook OAuth):', {
          sessionId: session._id.toString(),
          userId: user._id.toString(),
          refreshTokenHash: refreshTokenHash.substring(0, 16) + '...',
          expiresAt: session.expiresAt
        });
      } catch (sessionError) {
        console.error('❌ Error creating session (Facebook OAuth):', {
          error: sessionError.message,
          code: sessionError.code,
          name: sessionError.name
        });
        
        // If it's a duplicate key error, try to update existing session instead
        if (sessionError.code === 11000 || sessionError.message.includes('duplicate')) {
          try {
            const existingSession = await Session.findOneAndUpdate(
              { refreshTokenHash },
              {
                userId: user._id,
                expiresAt,
                ipAddress,
                userAgent,
                isRevoked: false,
                updatedAt: new Date()
              },
              { upsert: true, new: true }
            );
            console.log('✅ Session updated/created via upsert (Facebook OAuth):', {
              sessionId: existingSession._id.toString(),
              userId: user._id.toString()
            });
          } catch (upsertError) {
            console.error('❌ Error upserting session (Facebook OAuth):', upsertError);
          }
        }
      }

      // Set cookies and redirect to dashboard
      const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
      res
        .cookie('accessToken', accessToken, {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000, // 15 minutes
        })
        .cookie('refreshToken', refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .redirect(frontendUrl);
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

// Email verification route
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Verification link has expired. Please request a new verification email.',
          expired: true
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token.'
        });
      } else {
        throw jwtError;
      }
    }

    // Check token type
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type for email verification.'
      });
    }

    // Find user by token or userId
    const user = await User.findOne({
      $or: [
        { verificationToken: token },
        { _id: decoded.userId }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this verification token.'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?status=already_verified`;
      return res.redirect(frontendUrl);
    }

    // Check if token matches
    if (user.verificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token does not match. Please use the latest verification link from your email.'
      });
    }

    // Check if token is expired (additional check)
    if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired. Please request a new verification email.',
        expired: true
      });
    }

    // Verify the user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    console.log(`✅ Email verified successfully for user: ${user.email}`);

    // Redirect to frontend with success status
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?status=success&email=${encodeURIComponent(user.email)}`;
    res.redirect(frontendUrl);
  } catch (error) {
    console.error('❌ Email verification error:', error);
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?status=error&message=${encodeURIComponent(error.message)}`;
    res.redirect(frontendUrl);
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a verification email has been sent.'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. You can log in.'
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        type: 'email_verification'
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.firstName || user.username
      );
      console.log(`✅ Verification email resent to: ${user.email}`);
      
      return res.json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing resend verification request'
    });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if email exists or not (security best practice)
    // Always return success message even if user doesn't exist
    if (!user) {
      console.log(`⚠️  Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate password reset token (expires in 10 minutes)
    const resetToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        type: 'password_reset'
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // 10 minutes expiration
    );

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.firstName || user.username
      );
      console.log(`✅ Password reset email sent to: ${user.email}`);
      
      return res.json({
        success: true,
        message: 'Password reset link has been sent to your email.'
      });
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Clear token if email failed
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing password reset request'
    });
  }
});

// Reset password route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Password reset link has expired. Please request a new one.',
          expired: true
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid password reset token.'
        });
      } else {
        throw jwtError;
      }
    }

    // Check token type
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type for password reset.'
      });
    }

    // Find user by token or userId
    const user = await User.findOne({
      $or: [
        { resetPasswordToken: token },
        { _id: decoded.userId }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found for this reset token.'
      });
    }

    // Check if token matches
    if (user.resetPasswordToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token does not match. Please use the latest reset link from your email.'
      });
    }

    // Check if token is expired (additional check)
    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link has expired. Please request a new one.',
        expired: true
      });
    }

    // Hash new password and update user
    user.password = password; // User model will hash it automatically via pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`✅ Password reset successfully for user: ${user.email}`);

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
});

// Verify token endpoint (for JWT session validation)
router.get('/verifyToken', authenticateToken, async (req, res) => {
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

// Alias for backward compatibility
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

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      // Token expired or invalid
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Hash the refresh token to find session
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find valid session
    const session = await Session.findValidSession(refreshTokenHash);

    if (!session) {
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(403).json({
        success: false,
        message: 'Session not found or revoked'
      });
    }

    // Rotate refresh token (generate new one)
    const newRefreshToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRE }
    );

    const newRefreshTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    // Update session with new refresh token
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    session.refreshTokenHash = newRefreshTokenHash;
    session.expiresAt = newExpiresAt;
    session.updatedAt = new Date();
    await session.save();

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );

    // Set new cookies
    res
      .cookie('accessToken', newAccessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: 'Token refreshed'
      });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
      error: error.message
    });
  }
});

// Logout endpoint (server-side session invalidation)
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Hash the refresh token
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Revoke session in database
      await Session.updateOne(
        { refreshTokenHash },
        {
          isRevoked: true,
          updatedAt: new Date()
        }
      );
    }

    // Clear cookies
    res
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .json({
        success: true,
        message: 'Logged out successfully'
      });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, clear cookies
    res
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .status(500).json({
        success: false,
        message: 'Server error during logout',
        error: error.message
      });
  }
});

// ==================== MIDDLEWARE ====================

// Middleware to authenticate JWT token
async function authenticateToken(req, res, next) {
  // Ensure JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not configured!');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: JWT_SECRET not set'
    });
  }

  // Try to get token from cookie first (preferred)
  let token = req.cookies?.accessToken;

  // Fallback to Authorization header for backward compatibility
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  // Fallback to query string or body (for some legacy routes)
  if (!token) {
    token = req.query.token || req.body.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // If access token expired, try to refresh it
    if (err.name === 'TokenExpiredError') {
      const refreshToken = req.cookies?.refreshToken;
      
      if (refreshToken) {
        try {
          // Verify refresh token
          const refreshPayload = jwt.verify(refreshToken, process.env.JWT_SECRET);
          
          // Hash refresh token to find session
          const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

          // Check if session is valid
          const session = await Session.findValidSession(refreshTokenHash);
          
          if (session) {
            // Generate new access token
            const newAccessToken = jwt.sign(
              { userId: refreshPayload.userId },
              process.env.JWT_SECRET,
              { expiresIn: ACCESS_TOKEN_EXPIRE }
            );

            // Set new access token cookie
            res.cookie('accessToken', newAccessToken, {
              ...cookieOptions,
              maxAge: 15 * 60 * 1000,
            });

            req.user = refreshPayload;
            return next();
          }
        } catch (refreshErr) {
          // Refresh token also invalid, clear cookies
          res.clearCookie('accessToken', cookieOptions);
          res.clearCookie('refreshToken', cookieOptions);
        }
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

// Export middleware for use in other routes
export { authenticateToken };

export default router;
