# Fragrance AI Backend API

A comprehensive backend API for the Fragrance AI application, built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based user authentication
- **Fragrance Management**: CRUD operations for perfumes with advanced filtering
- **AI-Powered Analysis**: Python-based fragrance note analysis
- **Custom Blend Creation**: User-generated fragrance compositions
- **Review System**: Comprehensive review and rating system
- **Recommendation Engine**: AI-powered fragrance recommendations
- **Data Seeding**: Automated database population from CSV files

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting
- **AI Integration**: Python scripts for fragrance analysis
- **Data Processing**: CSV parsing for database seeding

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Fragrances (`/api/fragrance`)
- `GET /` - Get all perfumes with filtering and pagination
- `GET /:id` - Get perfume by ID
- `GET /search/:query` - Search perfumes
- `POST /recommendations` - Get AI-powered recommendations
- `POST /analyze` - Analyze fragrance notes with AI
- `GET /trending/trending` - Get trending perfumes
- `GET /brands/list` - Get all brands
- `GET /families/list` - Get fragrance families

### Custom Blends (`/api/custom-blend`)
- `POST /` - Create custom blend
- `GET /my-blends` - Get user's custom blends
- `GET /public` - Get public custom blends
- `GET /:id` - Get custom blend by ID
- `PUT /:id` - Update custom blend
- `DELETE /:id` - Delete custom blend
- `POST /:id/duplicate` - Duplicate custom blend
- `POST /:id/analyze` - Analyze custom blend with AI
- `POST /:id/rate` - Rate custom blend

### Reviews (`/api/review`)
- `POST /` - Create review
- `GET /perfume/:perfumeId` - Get reviews for perfume
- `GET /my-reviews` - Get user's reviews
- `GET /:id` - Get review by ID
- `PUT /:id` - Update review
- `DELETE /:id` - Delete review
- `POST /:id/helpful` - Mark review as helpful
- `POST /:id/not-helpful` - Mark review as not helpful
- `GET /perfume/:perfumeId/rating` - Get perfume rating summary

## Installation

1. **Install Dependencies**
   ```bash
   cd "back end"
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fragrance_ai
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   ```

3. **Python Dependencies**
   ```bash
   pip install numpy
   ```

4. **Start the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Seeding

To populate the database with fragrance data:

```bash
npm run seed
```

This will:
- Clear existing perfume data
- Import data from CSV files in the `../Datasets/` directory
- Create sample data if no CSV files are found
- Remove duplicates and clean data

## AI Model Integration

The backend integrates with a Python-based AI model for fragrance analysis:

### Features
- **Note Categorization**: Automatically categorizes fragrance notes
- **Balance Analysis**: Calculates balance between different note types
- **Seasonality Detection**: Determines optimal seasons for fragrances
- **Occasion Matching**: Suggests appropriate occasions
- **Intensity Calculation**: Estimates fragrance intensity
- **Longevity Prediction**: Predicts fragrance longevity
- **Mood Analysis**: Determines fragrance mood and personality
- **Compatibility Scoring**: Provides compatibility scores (0-100)

### AI Model Suggestions

For production deployment, consider these AI models:

1. **Ollama with 8B Parameters**
   - Model: `llama3.1:8b` or `mistral:7b`
   - Good for: Text analysis, note categorization
   - Resource requirements: 8GB RAM minimum

2. **Hugging Face Transformers**
   - Model: `microsoft/DialoGPT-medium`
   - Good for: Conversational AI, recommendation explanations
   - Resource requirements: 4GB RAM

3. **Custom TensorFlow Model**
   - For: Advanced fragrance classification
   - Requires: Training data, ML expertise
   - Resource requirements: 16GB+ RAM

4. **OpenAI API Integration**
   - Model: `gpt-3.5-turbo`
   - Good for: Natural language analysis
   - Cost: Pay-per-use

## API Usage Examples

### Authentication
```javascript
// Register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user123',
    email: 'user@example.com',
    password: 'password123'
  })
});

// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

### Fragrance Analysis
```javascript
// Analyze fragrance notes
const response = await fetch('/api/fragrance/analyze', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    notes: ['vanilla', 'rose', 'sandalwood']
  })
});
```

### Get Recommendations
```javascript
// Get AI recommendations
const response = await fetch('/api/fragrance/recommendations', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    preferences: {
      gender: 'Women',
      season: ['Spring', 'Summer'],
      occasion: ['Casual', 'Work'],
      intensity: 'Moderate',
      priceRange: { min: 50, max: 200 }
    }
  })
});
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Set via environment variables
- **Headers**: Rate limit info included in response headers

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: DDoS protection
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## Development

### Project Structure
```
back end/
├── models/           # MongoDB models
├── routes/           # API route handlers
├── ai/              # Python AI scripts
├── scripts/         # Database seeding
├── server.js       # Main server file
└── package.json    # Dependencies
```

### Adding New Features

1. **New Model**: Create in `models/` directory
2. **New Route**: Create in `routes/` directory
3. **Register Route**: Add to `server.js`
4. **Update API**: Document new endpoints

## Deployment

### Environment Variables
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

### Production Considerations
- Use PM2 for process management
- Set up MongoDB Atlas for database
- Configure reverse proxy (Nginx)
- Set up SSL certificates
- Monitor with logging services
- Set up CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
