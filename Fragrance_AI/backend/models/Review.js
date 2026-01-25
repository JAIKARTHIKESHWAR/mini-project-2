import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  perfume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Perfume',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  pros: [String],
  cons: [String],
  longevity: {
    type: String,
    enum: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
  },
  sillage: {
    type: String,
    enum: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
  },
  value: {
    type: String,
    enum: ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
  },
  season: [{
    type: String,
    enum: ['Spring', 'Summer', 'Fall', 'Winter']
  }],
  occasion: [{
    type: String,
    enum: ['Work', 'Casual', 'Date', 'Evening', 'Formal', 'Sport']
  }],
  age: {
    type: String,
    enum: ['18-25', '26-35', '36-45', '46-55', '55+']
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex']
  },
  skinType: {
    type: String,
    enum: ['Dry', 'Normal', 'Oily', 'Combination', 'Sensitive']
  },
  climate: {
    type: String,
    enum: ['Hot', 'Warm', 'Mild', 'Cool', 'Cold']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  aiInsights: {
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative']
    },
    keyPoints: [String],
    summary: String,
    helpfulnessScore: Number
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ perfume: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ 'aiInsights.sentiment': 1 });

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpful + this.notHelpful;
  return total > 0 ? (this.helpful / total) * 100 : 0;
});

// Method to mark as helpful
reviewSchema.methods.markHelpful = function() {
  this.helpful += 1;
  return this.save();
};

// Method to mark as not helpful
reviewSchema.methods.markNotHelpful = function() {
  this.notHelpful += 1;
  return this.save();
};

// Method to get review summary
reviewSchema.methods.getSummary = function() {
  return {
    id: this._id,
    user: this.user,
    rating: this.rating,
    title: this.title,
    content: this.content.substring(0, 200) + (this.content.length > 200 ? '...' : ''),
    pros: this.pros,
    cons: this.cons,
    helpfulnessRatio: this.helpfulnessRatio,
    createdAt: this.createdAt
  };
};

// Static method to get average rating for a perfume
reviewSchema.statics.getAverageRating = async function(perfumeId) {
  const result = await this.aggregate([
    { $match: { perfume: perfumeId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function(perfumeId) {
  const result = await this.aggregate([
    { $match: { perfume: perfumeId, isActive: true } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return result;
};

// Static method to get reviews by filters
reviewSchema.statics.getFilteredReviews = function(perfumeId, filters = {}) {
  const query = { perfume: perfumeId, isActive: true };
  
  if (filters.rating) {
    query.rating = filters.rating;
  }
  
  if (filters.season) {
    query.season = { $in: [filters.season] };
  }
  
  if (filters.occasion) {
    query.occasion = { $in: [filters.occasion] };
  }
  
  if (filters.age) {
    query.age = filters.age;
  }
  
  if (filters.gender) {
    query.gender = filters.gender;
  }
  
  return this.find(query)
    .populate('user', 'username profileImage')
    .sort({ createdAt: -1 });
};

export default mongoose.model('Review', reviewSchema);
