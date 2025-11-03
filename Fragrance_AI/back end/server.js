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
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST - use absolute path
dotenv.config({ path: join(__dirname, '.env') });

// Import routes
import authRoutes from './routes/auth.js';
import fragranceRoutes from './routes/fragrance.js';
import customBlendRoutes from './routes/customBlend.js';
import reviewRoutes from './routes/review.js';

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET is not set in .env file!');
  console.error('   Please ensure JWT_SECRET is set in your .env file.');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error('❌ CRITICAL ERROR: SESSION_SECRET is not set in .env file!');
  console.error('   Please ensure SESSION_SECRET is set in your .env file.');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('❌ CRITICAL ERROR: MONGO_URI is not set in .env file!');
  console.error('   Please ensure MONGO_URI is set in your .env file.');
  process.exit(1);
}

// Log environment status
console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   PORT: ${process.env.PORT || 5000}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Not set'}`);
console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`   GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set (Length: ' + process.env.JWT_SECRET.length + ')' : '❌ Not set'}`);
console.log(`   SESSION_SECRET: ${process.env.SESSION_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set (Email verification disabled)'}`);
console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set (Email verification disabled)'}`);

// Import Passport configurations AFTER environment variables are loaded
// We need to import them dynamically to ensure env vars are loaded first

// Create async function to handle MongoDB connection and server startup
async function startServer() {
  // Connect to MongoDB FIRST before anything else
  console.log('🔌 Connecting to MongoDB...');
  const MONGO_URI = process.env.MONGO_URI;
  
  try {
    await mongoose.connect(MONGO_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      // Add connection options to prevent timeout
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    
    console.log("✅ MongoDB Connected to Atlas");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    console.log("🌐 Host:", mongoose.connection.host);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  }

  // Now that MongoDB is connected, we can load Passport strategies
  console.log('🔐 Loading Passport configurations...');
  await import('./config/passportGoogle.js');
  await import('./config/passportFacebook.js');
  console.log('✅ Passport configurations loaded');

  // Create Express app AFTER MongoDB connection
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
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Session configuration for OAuth
  app.use(session({
    secret: process.env.SESSION_SECRET,
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

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Fragrance AI API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/fragrance', fragranceRoutes);
  app.use('/api/custom-blend', customBlendRoutes);
  app.use('/api/review', reviewRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
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
    console.log(`🔐 JWT_SECRET: ✅ Configured`);
    console.log(`🍪 SESSION_SECRET: ✅ Configured`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
