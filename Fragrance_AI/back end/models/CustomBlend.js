import mongoose from 'mongoose';

const customBlendSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    concentration: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    category: {
      type: String,
      enum: ['Top', 'Middle', 'Base'],
      required: true
    }
  }],
  composition: {
    topNotes: [String],
    middleNotes: [String],
    baseNotes: [String]
  },
  aiAnalysis: {
    balance: {
      floral: Number,
      woody: Number,
      citrus: Number,
      fresh: Number,
      spicy: Number,
      sweet: Number
    },
    seasonality: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season']
    },
    occasion: {
      type: String,
      enum: ['Work', 'Casual', 'Date', 'Evening', 'Formal', 'Sport']
    },
    intensity: {
      type: String,
      enum: ['Light', 'Moderate', 'Strong']
    },
    longevity: {
      type: String,
      enum: ['2-4 hours', '4-6 hours', '6-8 hours', '8+ hours']
    },
    mood: String,
    personality: String,
    suggestions: [String],
    compatibilityScore: Number
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowDuplication: {
      type: Boolean,
      default: true
    },
    tags: [String]
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    duplications: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  version: {
    type: Number,
    default: 1
  },
  parentBlend: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomBlend'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
customBlendSchema.index({ user: 1 });
customBlendSchema.index({ name: 'text', description: 'text' });
customBlendSchema.index({ 'settings.isPublic': 1 });
customBlendSchema.index({ 'statistics.rating': -1 });
customBlendSchema.index({ createdAt: -1 });

// Virtual for total notes count
customBlendSchema.virtual('totalNotes').get(function() {
  return this.notes.length;
});

// Method to calculate composition
customBlendSchema.methods.calculateComposition = function() {
  const composition = {
    topNotes: [],
    middleNotes: [],
    baseNotes: []
  };
  
  this.notes.forEach(note => {
    if (note.category === 'Top') {
      composition.topNotes.push(note.note);
    } else if (note.category === 'Middle') {
      composition.middleNotes.push(note.note);
    } else if (note.category === 'Base') {
      composition.baseNotes.push(note.note);
    }
  });
  
  this.composition = composition;
  return composition;
};

// Method to get blend summary
customBlendSchema.methods.getBlendSummary = function() {
  return {
    name: this.name,
    totalNotes: this.totalNotes,
    composition: this.composition,
    aiAnalysis: this.aiAnalysis,
    statistics: this.statistics
  };
};

// Method to duplicate blend
customBlendSchema.methods.duplicate = function(newUserId, newName) {
  const duplicatedBlend = new this.constructor({
    name: newName || `${this.name} (Copy)`,
    description: this.description,
    user: newUserId,
    notes: this.notes,
    composition: this.composition,
    settings: {
      ...this.settings,
      isPublic: false
    },
    parentBlend: this._id,
    version: 1
  });
  
  // Increment duplication count
  this.statistics.duplications += 1;
  this.save();
  
  return duplicatedBlend;
};

// Method to update AI analysis
customBlendSchema.methods.updateAIAnalysis = function(analysis) {
  this.aiAnalysis = { ...this.aiAnalysis, ...analysis };
  return this.save();
};

export default mongoose.model('CustomBlend', customBlendSchema);
