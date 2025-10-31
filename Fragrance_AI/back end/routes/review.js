import express from 'express';
import Review from '../models/Review.js';
import Perfume from '../models/Perfume.js';

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

// Create a new review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      perfume,
      rating,
      title,
      content,
      pros,
      cons,
      longevity,
      sillage,
      value,
      season,
      occasion,
      age,
      gender,
      skinType,
      climate
    } = req.body;

    // Validate required fields
    if (!perfume || !rating || !content) {
      return res.status(400).json({
        success: false,
        message: 'Perfume, rating, and content are required'
      });
    }

    // Check if perfume exists
    const perfumeExists = await Perfume.findById(perfume);
    if (!perfumeExists) {
      return res.status(404).json({
        success: false,
        message: 'Perfume not found'
      });
    }

    // Check if user already reviewed this perfume
    const existingReview = await Review.findOne({
      user: req.user.userId,
      perfume: perfume,
      isActive: true
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this perfume'
      });
    }

    const review = new Review({
      user: req.user.userId,
      perfume,
      rating,
      title,
      content,
      pros: pros || [],
      cons: cons || [],
      longevity,
      sillage,
      value,
      season: season || [],
      occasion: occasion || [],
      age,
      gender,
      skinType,
      climate
    });

    await review.save();

    // Update perfume rating
    await updatePerfumeRating(perfume);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// Get reviews for a perfume
router.get('/perfume/:perfumeId', async (req, res) => {
  try {
    const { perfumeId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      season,
      occasion,
      age,
      gender,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = { perfume: perfumeId, isActive: true };

    if (rating) filters.rating = parseInt(rating);
    if (season) filters.season = { $in: [season] };
    if (occasion) filters.occasion = { $in: [occasion] };
    if (age) filters.age = age;
    if (gender) filters.gender = gender;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filters)
      .populate('user', 'username profileImage')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filters);

    // Get rating distribution
    const ratingDistribution = await Review.getRatingDistribution(perfumeId);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      ratingDistribution
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ 
      user: req.user.userId, 
      isActive: true 
    })
    .populate('perfume', 'name brand imageUrl')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Review.countDocuments({ 
      user: req.user.userId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews',
      error: error.message
    });
  }
});

// Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username profileImage')
      .populate('perfume', 'name brand imageUrl');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
});

// Update review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      rating,
      title,
      content,
      pros,
      cons,
      longevity,
      sillage,
      value,
      season,
      occasion
    } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.userId,
      isActive: true
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (content !== undefined) review.content = content;
    if (pros !== undefined) review.pros = pros;
    if (cons !== undefined) review.cons = cons;
    if (longevity !== undefined) review.longevity = longevity;
    if (sillage !== undefined) review.sillage = sillage;
    if (value !== undefined) review.value = value;
    if (season !== undefined) review.season = season;
    if (occasion !== undefined) review.occasion = occasion;

    await review.save();

    // Update perfume rating if rating changed
    if (rating !== undefined) {
      await updatePerfumeRating(review.perfume);
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// Delete review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    review.isActive = false;
    await review.save();

    // Update perfume rating
    await updatePerfumeRating(review.perfume);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

// Mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markHelpful();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpful: review.helpful,
        notHelpful: review.notHelpful,
        helpfulnessRatio: review.helpfulnessRatio
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message
    });
  }
});

// Mark review as not helpful
router.post('/:id/not-helpful', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markNotHelpful();

    res.json({
      success: true,
      message: 'Review marked as not helpful',
      data: {
        helpful: review.helpful,
        notHelpful: review.notHelpful,
        helpfulnessRatio: review.helpfulnessRatio
      }
    });
  } catch (error) {
    console.error('Mark not helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking review as not helpful',
      error: error.message
    });
  }
});

// Get perfume rating summary
router.get('/perfume/:perfumeId/rating', async (req, res) => {
  try {
    const { perfumeId } = req.params;

    const ratingSummary = await Review.getAverageRating(perfumeId);
    const ratingDistribution = await Review.getRatingDistribution(perfumeId);

    res.json({
      success: true,
      data: {
        averageRating: ratingSummary.averageRating,
        totalReviews: ratingSummary.totalReviews,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get rating summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rating summary',
      error: error.message
    });
  }
});

// Helper function to update perfume rating
async function updatePerfumeRating(perfumeId) {
  try {
    const ratingData = await Review.getAverageRating(perfumeId);
    
    await Perfume.findByIdAndUpdate(perfumeId, {
      rating: Math.round(ratingData.averageRating * 10) / 10,
      ratingCount: ratingData.totalReviews
    });
  } catch (error) {
    console.error('Update perfume rating error:', error);
  }
}

export default router;
