import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId;
    },
    unique: true,
    sparse: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId;
    },
    minlength: 6
  },
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  // Login tracking
  loginHistory: [{
    loginTime: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    loginMethod: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active'
  },
  // Email verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  // Password reset
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  birthdate: {
    type: Date
  },
  timeZone: {
    type: String,
    trim: true
  },
  preferences: {
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
      default: 'Unisex'
    },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1000 }
    },
    preferredNotes: [String],
    avoidedNotes: [String],
    intensity: {
      type: String,
      enum: ['Light', 'Moderate', 'Strong'],
      default: 'Moderate'
    },
    longevity: {
      type: String,
      enum: ['2-4 hours', '4-6 hours', '6-8 hours', '8+ hours'],
      default: '4-6 hours'
    },
    season: [{
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter']
    }],
    occasion: [{
      type: String,
      enum: ['Work', 'Casual', 'Date', 'Evening', 'Formal', 'Sport']
    }]
  },
  fragranceProfile: {
    personality: String,
    mood: String,
    style: String,
    favoriteBrands: [String],
    skinType: String,
    climate: String
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Perfume'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Perfume'
  }],
  customBlends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomBlend'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  aiInsights: {
    personalityAnalysis: String,
    recommendationHistory: [String],
    learningProgress: Number,
    preferencesEvolution: [Object]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
});

// Method to update preferences
userSchema.methods.updatePreferences = function(newPreferences) {
  this.preferences = { ...this.preferences, ...newPreferences };
  return this.save();
};

// Method to add to wishlist
userSchema.methods.addToWishlist = function(perfumeId) {
  if (!this.wishlist.includes(perfumeId)) {
    this.wishlist.push(perfumeId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove from wishlist
userSchema.methods.removeFromWishlist = function(perfumeId) {
  this.wishlist = this.wishlist.filter(id => !id.equals(perfumeId));
  return this.save();
};

// Method to add to favorites
userSchema.methods.addToFavorites = function(perfumeId) {
  if (!this.favorites.includes(perfumeId)) {
    this.favorites.push(perfumeId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to get user's fragrance profile
userSchema.methods.getFragranceProfile = function() {
  return {
    preferences: this.preferences,
    profile: this.fragranceProfile,
    wishlistCount: this.wishlist.length,
    favoritesCount: this.favorites.length,
    customBlendsCount: this.customBlends.length
  };
};

// Static method to find or create OAuth user
userSchema.statics.findOrCreateOAuthUser = async function(profile, provider) {
  try {
    // Ensure MongoDB connection is ready
    if (this.db.readyState !== 1) {
      throw new Error('Database connection not ready. Please wait and try again.');
    }

    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      throw new Error('Email is required for OAuth authentication');
    }

    let user = await this.findOne({
      $or: [
        { [`${provider}Id`]: profile.id },
        { email: email }
      ]
    });

    if (user) {
      // Update OAuth ID if not set
      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = profile.id;
        user.authProvider = provider;
        await user.save();
      }
      return user;
    }

    // Create new user
    const newUser = new this({
      [`${provider}Id`]: profile.id,
      email: email,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      username: email.split('@')[0] + '_' + Date.now(),
      profileImage: profile.photos?.[0]?.value || '',
      authProvider: provider,
      isActive: true,
      lastLogin: new Date()
    });

    await newUser.save();
    console.log('✅ Created new OAuth user:', newUser.email);
    return newUser;
  } catch (error) {
    console.error(`❌ Error creating/finding OAuth user (${provider}):`, error);
    throw new Error(`Error creating/finding OAuth user: ${error.message}`);
  }
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Please set it in your .env file.');
  }
  
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      authProvider: this.authProvider
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

// Method to add login history
userSchema.methods.addLoginHistory = function(ipAddress, userAgent, loginMethod) {
  this.loginHistory.push({
    loginTime: new Date(),
    ipAddress: ipAddress,
    userAgent: userAgent,
    loginMethod: loginMethod
  });
  this.lastLogin = new Date();
  return this.save();
};

// Method to check if user exists
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Method to check if user exists by Google ID
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId: googleId });
};

export default mongoose.model('User', userSchema);
