import express from 'express';
import Perfume from '../models/Perfume.js';
import { spawn } from 'child_process';
import path from 'path';

const router = express.Router();

// Get all perfumes with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      brand,
      gender,
      fragranceFamily,
      minPrice,
      maxPrice,
      season,
      occasion,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (gender) filter.gender = gender;
    if (fragranceFamily) filter.fragranceFamily = { $regex: fragranceFamily, $options: 'i' };
    if (season) filter.season = { $in: [season] };
    if (occasion) filter.occasion = { $in: [occasion] };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const perfumes = await Perfume.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Perfume.countDocuments(filter);

    res.json({
      success: true,
      data: perfumes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get perfumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching perfumes',
      error: error.message
    });
  }
});

// Get perfume by ID
router.get('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    
    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: 'Perfume not found'
      });
    }

    res.json({
      success: true,
      data: perfume
    });
  } catch (error) {
    console.error('Get perfume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching perfume',
      error: error.message
    });
  }
});

// Search perfumes
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const perfumes = await Perfume.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { brand: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { notes: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      ]
    })
    .limit(parseInt(limit))
    .select('name brand imageUrl price rating');

    res.json({
      success: true,
      data: perfumes
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching perfumes',
      error: error.message
    });
  }
});

// Get recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { preferences, userId } = req.body;

    // Build recommendation query based on preferences
    const filter = { isActive: true };

    if (preferences.gender) {
      filter.gender = { $in: [preferences.gender, 'Unisex'] };
    }

    if (preferences.season) {
      filter.season = { $in: preferences.season };
    }

    if (preferences.occasion) {
      filter.occasion = { $in: preferences.occasion };
    }

    if (preferences.intensity) {
      filter.intensity = preferences.intensity;
    }

    if (preferences.preferredNotes && preferences.preferredNotes.length > 0) {
      filter.notes = { $in: preferences.preferredNotes.map(note => new RegExp(note, 'i')) };
    }

    if (preferences.priceRange) {
      filter.price = {
        $gte: preferences.priceRange.min || 0,
        $lte: preferences.priceRange.max || 1000
      };
    }

    // Get recommended perfumes
    const recommendations = await Perfume.find(filter)
      .sort({ rating: -1, price: 1 })
      .limit(20);

    // Calculate match scores
    const scoredRecommendations = recommendations.map(perfume => {
      let matchScore = 50; // Base score

      // Score based on notes match
      if (preferences.preferredNotes) {
        const noteMatches = perfume.notes.filter(note =>
          preferences.preferredNotes.some(prefNote =>
            note.toLowerCase().includes(prefNote.toLowerCase())
          )
        ).length;
        matchScore += (noteMatches / preferences.preferredNotes.length) * 30;
      }

      // Score based on occasion match
      if (preferences.occasion && perfume.occasion.includes(preferences.occasion)) {
        matchScore += 15;
      }

      // Score based on season match
      if (preferences.season && perfume.season.includes(preferences.season)) {
        matchScore += 15;
      }

      // Score based on intensity match
      if (preferences.intensity && perfume.intensity === preferences.intensity) {
        matchScore += 10;
      }

      return {
        ...perfume.toObject(),
        matchScore: Math.min(Math.round(matchScore), 100),
        aiInsight: generateAIInsight(perfume, preferences)
      };
    });

    // Sort by match score
    scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: scoredRecommendations.slice(0, 10)
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

// Analyze fragrance notes using AI
router.post('/analyze', async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notes array is required'
      });
    }

    // Call Python AI model
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
        console.error('Python script error:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'AI analysis failed',
          error: errorOutput
        });
      }

      try {
        const analysis = JSON.parse(output);
        res.json({
          success: true,
          prediction: analysis.prediction,
          analysis: analysis.analysis,
          suggestions: analysis.suggestions
        });
      } catch (parseError) {
        // If JSON parsing fails, return the raw output
        res.json({
          success: true,
          prediction: output.trim(),
          analysis: {
            balance: calculateBalance(notes),
            seasonality: getSeasonality(notes),
            occasion: getRecommendedOccasion(notes),
            intensity: calculateIntensity(notes),
            longevity: estimateLongevity(notes)
          },
          suggestions: generateCompositionSuggestions(notes)
        });
      }
    });

    python.on('error', (error) => {
      console.error('Python spawn error:', error);
      res.status(500).json({
        success: false,
        message: 'AI model not available',
        error: error.message
      });
    });

  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing fragrance',
      error: error.message
    });
  }
});

// Get trending perfumes
router.get('/trending/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trending = await Perfume.find({ isActive: true })
      .sort({ rating: -1, ratingCount: -1 })
      .limit(parseInt(limit))
      .select('name brand imageUrl price rating ratingCount');

    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending perfumes',
      error: error.message
    });
  }
});

// Get brands
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await Perfume.distinct('brand', { isActive: true });
    res.json({
      success: true,
      data: brands.sort()
    });
  } catch (error) {
    console.error('Brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      error: error.message
    });
  }
});

// Get fragrance families
router.get('/families/list', async (req, res) => {
  try {
    const families = await Perfume.distinct('fragranceFamily', { isActive: true });
    res.json({
      success: true,
      data: families.filter(family => family).sort()
    });
  } catch (error) {
    console.error('Families error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fragrance families',
      error: error.message
    });
  }
});

// Helper functions
function generateAIInsight(perfume, preferences) {
  const insights = [
    "This fragrance perfectly matches your preferred occasion and season.",
    "Great choice! The notes align well with your scent preferences.",
    "Based on your profile, this fragrance should work well for you.",
    "The intensity and longevity match what you're looking for."
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

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
