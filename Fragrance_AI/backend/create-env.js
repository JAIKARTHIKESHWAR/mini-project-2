import fs from 'fs';
import path from 'path';

const envContent = `# ===========================================
# FRAGRANCE AI - ENVIRONMENT CONFIGURATION
# ===========================================

# ==================== SERVER CONFIG ====================
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# ==================== DATABASE CONFIG ====================
MONGO_URI=mongodb+srv://fragrance_db:151005@fragrance-ai.rrepxjp.mongodb.net/fragrance_ai?retryWrites=true&w=majority&appName=fragrance-ai

# ==================== JWT CONFIG ====================
JWT_SECRET=fragrance_ai_super_secret_jwt_key_2024_secure_random_string_12345
JWT_EXPIRE=7d

# ==================== SESSION CONFIG ====================
SESSION_SECRET=fragrance_ai_super_secret_session_key_2024_secure_random_string_67890

# ==================== GOOGLE OAUTH CONFIG ====================
# Replace these with your actual Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ==================== FACEBOOK OAUTH CONFIG ====================
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# ==================== RATE LIMITING CONFIG ====================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==================== AI MODEL CONFIG ====================
AI_MODEL_PATH=./ai/models/
PYTHON_PATH=python

# ==================== FILE UPLOAD CONFIG ====================
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads/
`;

const envPath = path.join(process.cwd(), '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please edit the .env file and add your actual Google OAuth credentials:');
    console.log('   - GOOGLE_CLIENT_ID');
    console.log('   - GOOGLE_CLIENT_SECRET');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
