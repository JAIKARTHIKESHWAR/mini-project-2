import { OllamaEmbeddings } from '@langchain/ollama';
import mongoose from 'mongoose';
import Perfume from '../../models/Perfume.js';

// MongoDB Atlas Vector Search will be loaded dynamically if available
let MongoDBAtlasVectorSearch = null;

/**
 * RAG Setup Module
 * Handles embedding generation, vector store setup, and retrieval pipeline
 */

// Initialize embeddings model (Ollama)
let embeddings = null;
let vectorStore = null;
let isVectorStoreInitialized = false;

/**
 * Initialize Ollama embeddings
 */
export async function initializeEmbeddings() {
  try {
    if (!embeddings) {
      embeddings = new OllamaEmbeddings({
        model: 'llama3.2', // Using Llama 3.2 for embeddings
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      });
      console.log('✅ Ollama embeddings initialized');
    }
    return embeddings;
  } catch (error) {
    console.error('❌ Error initializing embeddings:', error);
    throw error;
  }
}

/**
 * Create vector store from MongoDB collection
 * Falls back to in-memory retrieval if vector store setup fails
 */
export async function initializeVectorStore() {
  try {
    // Get MongoDB connection from mongoose
    const mongoClient = mongoose.connection.client;
    const db = mongoose.connection.db;
    const collectionName = 'perfume_data'; // Use perfume_data collection as specified

    // Check if collection exists, if not use 'perfumes' (from Perfume model)
    const collections = await db.listCollections({ name: collectionName }).toArray();
    const targetCollection = collections.length > 0 ? collectionName : 'perfumes';

    if (!embeddings) {
      await initializeEmbeddings();
    }

    // Try to create vector store with MongoDB Atlas Vector Search
    // If it fails, we'll use fallback retrieval
    if (!MongoDBAtlasVectorSearch) {
      try {
        const mongoLangchain = await import('@langchain/mongodb');
        MongoDBAtlasVectorSearch = mongoLangchain.MongoDBAtlasVectorSearch;
      } catch (e) {
        console.warn('⚠️ MongoDB Atlas Vector Search not available, using fallback retrieval');
      }
    }

    if (MongoDBAtlasVectorSearch) {
      try {
        vectorStore = await MongoDBAtlasVectorSearch.fromExistingCollection(
          embeddings,
          {
            collection: db.collection(targetCollection),
            indexName: 'vector_index', // Create this index in MongoDB Atlas
          }
        );
        isVectorStoreInitialized = true;
        console.log(`✅ Vector store initialized with collection: ${targetCollection}`);
      } catch (vectorError) {
        console.warn('⚠️ Vector store initialization failed, using fallback retrieval:', vectorError.message);
        isVectorStoreInitialized = false;
      }
    } else {
      console.log('ℹ️ Using fallback text-based retrieval (vector search not configured)');
      isVectorStoreInitialized = false;
    }

    return { vectorStore, isInitialized: isVectorStoreInitialized };
  } catch (error) {
    console.error('❌ Error initializing vector store:', error);
    isVectorStoreInitialized = false;
    return { vectorStore: null, isInitialized: false };
  }
}

/**
 * Get embeddings instance
 */
export function getEmbeddings() {
  return embeddings;
}

/**
 * Get vector store instance
 */
export function getVectorStore() {
  return vectorStore;
}

/**
 * Check if vector store is initialized
 */
export function isInitialized() {
  return isVectorStoreInitialized;
}

/**
 * Fallback retrieval: Get relevant perfumes using MongoDB text search and similarity
 * This function retrieves top K documents based on query
 */
export async function retrieveRelevantPerfumes(query, limit = 5) {
  try {
    const db = mongoose.connection.db;
    const collectionName = 'perfume_data';
    const collections = await db.listCollections({ name: collectionName }).toArray();
    const targetCollection = collections.length > 0 ? collectionName : 'perfumes';

    // Build search query for MongoDB text search
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { notes: { $in: [new RegExp(query, 'i')] } },
        { fragranceFamily: { $regex: query, $options: 'i' } }
      ],
      isActive: { $ne: false }
    };

    // Use Perfume model if collection is 'perfumes', otherwise use direct MongoDB access
    if (targetCollection === 'perfumes') {
      const perfumes = await Perfume.find(searchQuery)
        .limit(limit)
        .select('name brand description notes topNotes middleNotes baseNotes price gender fragranceFamily season occasion rating imageUrl')
        .lean();
      
      return perfumes;
    } else {
      // Direct MongoDB collection access
      const collection = db.collection(targetCollection);
      const perfumes = await collection.find(searchQuery)
        .limit(limit)
        .project({
          name: 1,
          brand: 1,
          description: 1,
          notes: 1,
          topNotes: 1,
          middleNotes: 1,
          baseNotes: 1,
          price: 1,
          gender: 1,
          fragranceFamily: 1,
          season: 1,
          occasion: 1,
          rating: 1,
          imageUrl: 1
        })
        .toArray();
      
      return perfumes;
    }
  } catch (error) {
    console.error('❌ Error retrieving perfumes:', error);
    throw error;
  }
}

/**
 * Create context string from retrieved documents
 */
export function createContext(documents) {
  if (!documents || documents.length === 0) {
    return 'No relevant perfume information found.';
  }

  return documents.map((doc, index) => {
    const notes = doc.notes?.join(', ') || (doc.topNotes?.join(', ') + ', ' + doc.middleNotes?.join(', ') + ', ' + doc.baseNotes?.join(', ')) || 'N/A';
    return `
Perfume ${index + 1}:
- Name: ${doc.brand || ''} ${doc.name || 'Unknown'}
- Description: ${doc.description || 'No description available'}
- Notes: ${notes}
- Price: ${doc.price ? `₹${doc.price}` : 'Price not available'}
- Gender: ${doc.gender || 'Unisex'}
- Fragrance Family: ${doc.fragranceFamily || 'N/A'}
- Season: ${doc.season?.join(', ') || 'N/A'}
- Occasion: ${doc.occasion?.join(', ') || 'N/A'}
- Rating: ${doc.rating || 'N/A'}
`.trim();
  }).join('\n\n');
}

export default {
  initializeEmbeddings,
  initializeVectorStore,
  getEmbeddings,
  getVectorStore,
  isInitialized,
  retrieveRelevantPerfumes,
  createContext
};

