import express from 'express';
import CustomBlend from '../models/CustomBlend.js';
import { spawn } from 'child_process';
import path from 'path';

const router = express.Router();

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

  const jwt = require('jsonwebtoken');
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

// Create a new custom blend
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, notes, settings } = req.body;

    if (!name || !notes || notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name and notes are required'
      });
    }

    const customBlend = new CustomBlend({
      name,
      description,
      user: req.user.userId,
      notes,
      settings: settings || {}
    });

    // Calculate composition
    customBlend.calculateComposition();
    await customBlend.save();

    // Analyze with AI
    try {
      const analysis = await analyzeBlendWithAI(notes);
      customBlend.updateAIAnalysis(analysis);
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError);
      // Continue without AI analysis
    }

    res.status(201).json({
      success: true,
      message: 'Custom blend created successfully',
      data: customBlend
    });
  } catch (error) {
    console.error('Create blend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating custom blend',
      error: error.message
    });
  }
});

// Get user's custom blends
router.get('/my-blends', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blends = await CustomBlend.find({ 
      user: req.user.userId, 
      isActive: true 
    })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await CustomBlend.countDocuments({ 
      user: req.user.userId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: blends,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get blends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching custom blends',
      error: error.message
    });
  }
});

// Get public custom blends
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'statistics.rating', sortOrder = 'desc' } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blends = await CustomBlend.find({ 
      'settings.isPublic': true, 
      isActive: true 
    })
    .populate('user', 'username profileImage')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await CustomBlend.countDocuments({ 
      'settings.isPublic': true, 
      isActive: true 
    });

    res.json({
      success: true,
      data: blends,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get public blends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public blends',
      error: error.message
    });
  }
});

// Get custom blend by ID
router.get('/:id', async (req, res) => {
  try {
    const blend = await CustomBlend.findById(req.params.id)
      .populate('user', 'username profileImage');

    if (!blend) {
      return res.status(404).json({
        success: false,
        message: 'Custom blend not found'
      });
    }

    // Check if blend is public or belongs to user
    if (!blend.settings.isPublic && blend.user._id.toString() !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: blend
    });
  } catch (error) {
    console.error('Get blend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching custom blend',
      error: error.message
    });
  }
});

// Update custom blend
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, notes, settings } = req.body;

    const blend = await CustomBlend.findOne({
      _id: req.params.id,
      user: req.user.userId,
      isActive: true
    });

    if (!blend) {
      return res.status(404).json({
        success: false,
        message: 'Custom blend not found or access denied'
      });
    }

    // Update fields
    if (name) blend.name = name;
    if (description !== undefined) blend.description = description;
    if (notes) {
      blend.notes = notes;
      blend.calculateComposition();
    }
    if (settings) blend.settings = { ...blend.settings, ...settings };

    // Increment version
    blend.version += 1;

    // Re-analyze with AI if notes changed
    if (notes) {
      try {
        const analysis = await analyzeBlendWithAI(notes);
        blend.updateAIAnalysis(analysis);
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError);
      }
    }

    await blend.save();

    res.json({
      success: true,
      message: 'Custom blend updated successfully',
      data: blend
    });
  } catch (error) {
    console.error('Update blend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating custom blend',
      error: error.message
    });
  }
});

// Duplicate custom blend
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    const originalBlend = await CustomBlend.findById(req.params.id);

    if (!originalBlend) {
      return res.status(404).json({
        success: false,
        message: 'Original blend not found'
      });
    }

    // Check if duplication is allowed
    if (!originalBlend.settings.allowDuplication) {
      return res.status(403).json({
        success: false,
        message: 'Duplication not allowed for this blend'
      });
    }

    const duplicatedBlend = originalBlend.duplicate(req.user.userId, name);
    await duplicatedBlend.save();

    res.status(201).json({
      success: true,
      message: 'Custom blend duplicated successfully',
      data: duplicatedBlend
    });
  } catch (error) {
    console.error('Duplicate blend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating custom blend',
      error: error.message
    });
  }
});

// Delete custom blend
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const blend = await CustomBlend.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!blend) {
      return res.status(404).json({
        success: false,
        message: 'Custom blend not found or access denied'
      });
    }

    blend.isActive = false;
    await blend.save();

    res.json({
      success: true,
      message: 'Custom blend deleted successfully'
    });
  } catch (error) {
    console.error('Delete blend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting custom blend',
      error: error.message
    });
  }
});

// Analyze blend with AI
router.post('/:id/analyze', authenticateToken, async (req, res) => {
  try {
    const blend = await CustomBlend.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!blend) {
      return res.status(404).json({
        success: false,
        message: 'Custom blend not found or access denied'
      });
    }

    const analysis = await analyzeBlendWithAI(blend.notes);
    blend.updateAIAnalysis(analysis);
    await blend.save();

    res.json({
      success: true,
      message: 'Blend analyzed successfully',
      data: analysis
    });
  } catch (error) {
    console.error('Analyze blend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing custom blend',
      error: error.message
    });
  }
});

// Rate custom blend
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const blend = await CustomBlend.findById(req.params.id);

    if (!blend) {
      return res.status(404).json({
        success: false,
        message: 'Custom blend not found'
      });
    }

    // Update rating (simplified - in production, you'd want to track individual user ratings)
    const newRatingCount = blend.statistics.ratingCount + 1;
    const newRating = ((blend.statistics.rating * blend.statistics.ratingCount) + rating) / newRatingCount;

    blend.statistics.rating = Math.round(newRating * 10) / 10;
    blend.statistics.ratingCount = newRatingCount;
    await blend.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: blend.statistics.rating,
        ratingCount: blend.statistics.ratingCount
      }
    });
  } catch (error) {
    console.error('Rate blend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating custom blend',
      error: error.message
    });
  }
});

// Helper function to analyze blend with AI
async function analyzeBlendWithAI(notes) {
  return new Promise((resolve, reject) => {
    const python = spawn(process.env.PYTHON_PATH || 'python', [
      path.join(process.cwd(), 'ai', 'fragranceModel.py'),
      JSON.stringify(notes)
    ]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(errorOutput));
        return;
      }

      try {
        const analysis = JSON.parse(output);
        resolve(analysis);
      } catch (parseError) {
        // Fallback analysis
        resolve({
          balance: calculateBalance(notes),
          seasonality: getSeasonality(notes),
          occasion: getRecommendedOccasion(notes),
          intensity: calculateIntensity(notes),
          longevity: estimateLongevity(notes),
          suggestions: generateCompositionSuggestions(notes)
        });
      }
    });

    python.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper functions (same as in fragrance.js)
function calculateBalance(notes) {
  const categories = {
    floral: ['Rose', 'Jasmine', 'Lily', 'Lavender'],
    woody: ['Sandalwood', 'Cedar', 'Patchouli', 'Vetiver'],
    citrus: ['Lemon', 'Bergamot', 'Orange', 'Grapefruit'],
    fresh: ['Marine', 'Mint', 'Green Tea', 'Rain'],
    spicy: ['Cinnamon', 'Pepper', 'Cardamom', 'Ginger'],
    sweet: ['Vanilla', 'Caramel', 'Honey', 'Chocolate']
  };
  
  let balance = {};
  Object.keys(categories).forEach(category => {
    balance[category] = notes.filter(note => 
      categories[category].some(catNote => note.includes(catNote))
    ).length;
  });
  
  return balance;
}

function getSeasonality(notes) {
  const seasonalNotes = {
    spring: ['Floral', 'Green', 'Light Fruits'],
    summer: ['Citrus', 'Aquatic', 'Tropical'],
    fall: ['Woody', 'Spicy', 'Amber'],
    winter: ['Oriental', 'Sweet', 'Leather']
  };
  
  let scores = {};
  Object.keys(seasonalNotes).forEach(season => {
    scores[season] = notes.filter(note => 
      seasonalNotes[season].some(seasonNote => note.includes(seasonNote))
    ).length;
  });
  
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

function getRecommendedOccasion(notes) {
  const occasionNotes = {
    work: ['Bergamot', 'Neroli', 'White Musk'],
    date: ['Rose', 'Vanilla', 'Sandalwood'],
    evening: ['Oud', 'Leather', 'Patchouli'],
    casual: ['Citrus', 'Aquatic', 'Light Florals']
  };
  
  let scores = {};
  Object.keys(occasionNotes).forEach(occasion => {
    scores[occasion] = notes.filter(note => 
      occasionNotes[occasion].includes(note)
    ).length;
  });
  
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

function calculateIntensity(notes) {
  const intenseNotes = ['Oud', 'Leather', 'Patchouli', 'Amber', 'Incense'];
  const intenseCount = notes.filter(note => intenseNotes.includes(note)).length;
  
  if (intenseCount >= 3) return 'Strong';
  if (intenseCount >= 1) return 'Moderate';
  return 'Light';
}

function estimateLongevity(notes) {
  const baseNotes = ['Sandalwood', 'Amber', 'Musk', 'Vanilla', 'Patchouli'];
  const baseCount = notes.filter(note => baseNotes.includes(note)).length;
  
  if (baseCount >= 3) return '8+ hours';
  if (baseCount >= 2) return '6-8 hours';
  if (baseCount >= 1) return '4-6 hours';
  return '2-4 hours';
}

function generateCompositionSuggestions(notes) {
  const suggestions = [
    "Consider adding a base note like vanilla or amber for better longevity.",
    "The blend could benefit from a citrus top note for freshness.",
    "A touch of floral notes would add complexity to this composition.",
    "This is a well-balanced blend! Ready for testing."
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

export default router;
