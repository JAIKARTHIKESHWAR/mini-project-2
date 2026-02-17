import mongoose from 'mongoose';

const perfumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  notes: [{
    type: String,
    trim: true
  }],
  topNotes: [{
    type: String,
    trim: true
  }],
  middleNotes: [{
    type: String,
    trim: true
  }],
  baseNotes: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    default: 'Unisex'
  },
  productType: {
    type: String,
    enum: ['Perfume', 'Cologne', 'Eau de Toilette', 'Eau de Parfum', 'Extrait'],
    default: 'Perfume'
  },
  character: {
    type: String,
    trim: true
  },
  fragranceFamily: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  concentration: {
    type: String,
    trim: true
  },
  longevity: {
    type: String,
    enum: ['2-4 hours', '4-6 hours', '6-8 hours', '8+ hours'],
    default: '4-6 hours'
  },
  sillage: {
    type: String,
    enum: ['Light', 'Moderate', 'Strong'],
    default: 'Moderate'
  },
  intensity: {
    type: String,
    enum: ['Light', 'Moderate', 'Strong'],
    default: 'Moderate'
  },
  season: [{
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
  }],
  occasion: [{
    type: String,
    enum: ['Work', 'Casual', 'Date', 'Evening', 'Formal', 'Sport']
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiFeatures: {
    recommendedFor: [String],
    moodProfile: String,
    personalityMatch: String,
    compatibilityScore: Number
  }
}, {
  timestamps: true,
  collection: 'fragrance_data'
});

// Indexes for better performance
perfumeSchema.index({ name: 'text', brand: 'text', description: 'text' });
perfumeSchema.index({ notes: 1 });
perfumeSchema.index({ gender: 1 });
perfumeSchema.index({ fragranceFamily: 1 });
perfumeSchema.index({ price: 1 });
perfumeSchema.index({ rating: -1 });

// Virtual for full name
perfumeSchema.virtual('fullName').get(function () {
  return `${this.brand} ${this.name}`;
});

// Method to calculate average rating
perfumeSchema.methods.calculateAverageRating = function () {
  // This would be implemented with actual review data
  return this.rating;
};

// Method to get fragrance profile
perfumeSchema.methods.getFragranceProfile = function () {
  return {
    intensity: this.intensity,
    longevity: this.longevity,
    sillage: this.sillage,
    season: this.season,
    occasion: this.occasion
  };
};

export default mongoose.model('Perfume', perfumeSchema);
