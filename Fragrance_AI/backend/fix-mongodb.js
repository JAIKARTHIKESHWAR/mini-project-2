import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

try {
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update MongoDB URI to allow all IPs temporarily
    const newMongoUri = 'mongodb+srv://fragrance_db:151005@fragrance-ai.rrepxjp.mongodb.net/fragrance_ai?retryWrites=true&w=majority&appName=fragrance-ai';
    
    // Replace the MONGO_URI line
    envContent = envContent.replace(
      /MONGO_URI=.*/,
      `MONGO_URI=${newMongoUri}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ MongoDB URI updated in .env file');
    console.log('📝 Note: You may need to whitelist your IP in MongoDB Atlas');
    console.log('   Go to: https://cloud.mongodb.com/ → Network Access → Add IP Address');
    console.log('   Or add 0.0.0.0/0 to allow all IPs (less secure)');
  } else {
    console.log('❌ .env file not found');
  }
} catch (error) {
  console.error('❌ Error updating MongoDB URI:', error.message);
}
