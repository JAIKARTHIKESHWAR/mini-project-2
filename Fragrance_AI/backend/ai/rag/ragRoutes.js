import express from 'express';
import {
  processChatQuery,
  healthCheck,
  initializeRAG
} from './ragController.js';

const router = express.Router();

/**
 * Initialize RAG system on startup
 */
let ragInitialized = false;

async function ensureRAGInitialized(req, res, next) {
  if (!ragInitialized) {
    try {
      await initializeRAG();
      ragInitialized = true;
    } catch (error) {
      console.error('Failed to initialize RAG:', error);
      // Continue anyway - will try to initialize on first request
    }
  }
  next();
}

// Apply middleware to all routes
router.use(ensureRAGInitialized);

/**
 * POST /api/chat
 * Chat endpoint for RAG-based queries
 * 
 * Request body:
 * {
 *   "query": "User question string"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "answer": "AI response",
 *   "sources": [...],
 *   "query": "original query",
 *   "timestamp": "ISO timestamp"
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const { query } = req.body;

    // Validate input
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required in request body',
        error: 'Missing query parameter'
      });
    }

    if (typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query must be a string',
        error: 'Invalid query type'
      });
    }

    if (query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query cannot be empty',
        error: 'Empty query'
      });
    }

    // Ensure RAG is initialized
    if (!ragInitialized) {
      try {
        await initializeRAG();
        ragInitialized = true;
      } catch (initError) {
        console.error('RAG initialization failed:', initError);
        return res.status(500).json({
          success: false,
          message: 'RAG system not available. Please check Ollama is running.',
          error: initError.message
        });
      }
    }

    // Process the query
    const result = await processChatQuery(query);

    // Return response
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing chat query',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/chat/health
 * Health check endpoint for RAG system
 */
router.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    
    res.json({
      success: true,
      ...health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking RAG system health',
      error: error.message
    });
  }
});

/**
 * POST /api/chat/initialize
 * Manually initialize RAG system
 */
router.post('/initialize', async (req, res) => {
  try {
    await initializeRAG();
    ragInitialized = true;
    
    res.json({
      success: true,
      message: 'RAG system initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize RAG system',
      error: error.message,
      hint: 'Make sure Ollama is running with llama3.2 model installed'
    });
  }
});

export default router;

