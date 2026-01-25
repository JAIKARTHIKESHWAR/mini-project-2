import { ChatOllama } from '@langchain/ollama';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  initializeEmbeddings,
  initializeVectorStore,
  retrieveRelevantPerfumes,
  createContext,
  isInitialized
} from './ragSetup.js';

/**
 * RAG Controller Module
 * Handles chat queries, retrieval, and response generation
 */

let llm = null;
let ragChain = null;

// Initialize RAG chain
let isRAGInitialized = false;

/**
 * Initialize LLM (Ollama with Llama 3.2)
 */
export async function initializeLLM() {
  try {
    if (!llm) {
      llm = new ChatOllama({
        model: 'llama3.2',
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        temperature: 0.7,
        numCtx: 4096,
      });
      console.log('✅ Ollama LLM initialized');
    }
    return llm;
  } catch (error) {
    console.error('❌ Error initializing LLM:', error);
    throw error;
  }
}

/**
 * Initialize RAG system
 */
export async function initializeRAG() {
  try {
    // Initialize embeddings and vector store
    await initializeEmbeddings();
    await initializeVectorStore();
    
    // Initialize LLM
    await initializeLLM();

    // Create RAG prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful and knowledgeable fragrance AI assistant specialized in perfume recommendations and scent knowledge.

Your role is to help users discover perfumes, understand fragrance notes, and make informed decisions about scents.

Use the following context information about perfumes to answer the user's question. If the context doesn't contain enough information, use your general knowledge about perfumes, but always prioritize the provided context.

Context Information:
{context}

User Question: {question}

Instructions:
1. Provide a helpful, friendly, and conversational response
2. Reference specific perfumes from the context when relevant
3. Include price information if available in the context
4. Be concise but informative
5. If recommending perfumes, mention why they're suitable based on the user's query
6. Use natural language and avoid technical jargon unless necessary

Answer:`);

    // Create retrieval function
    const retrievalChain = RunnableSequence.from([
      {
        context: async ({ question }) => {
          try {
            // Try vector store retrieval if available
            const vectorStore = (await initializeVectorStore()).vectorStore;
            
            if (vectorStore && isInitialized()) {
              // Use vector store retrieval
              const docs = await vectorStore.similaritySearch(question, 5);
              return createContext(docs);
            } else {
              // Fallback to text-based retrieval
              const docs = await retrieveRelevantPerfumes(question, 5);
              return createContext(docs);
            }
          } catch (error) {
            console.error('Retrieval error:', error);
            // Fallback to basic retrieval
            const docs = await retrieveRelevantPerfumes(question, 5);
            return createContext(docs);
          }
        },
        question: new RunnablePassthrough(),
      },
      promptTemplate,
      llm,
      new StringOutputParser(),
    ]);

    ragChain = retrievalChain;
    isRAGInitialized = true;
    console.log('✅ RAG system initialized');
    
    return ragChain;
  } catch (error) {
    console.error('❌ Error initializing RAG:', error);
    throw error;
  }
}

/**
 * Process chat query using RAG
 */
export async function processChatQuery(query, options = {}) {
  try {
    // Ensure RAG is initialized
    if (!isRAGInitialized) {
      await initializeRAG();
    }

    if (!ragChain) {
      throw new Error('RAG chain not initialized');
    }

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query must be a non-empty string');
    }

    const trimmedQuery = query.trim();

    // Invoke RAG chain
    console.log(`🔍 Processing query: ${trimmedQuery}`);
    
    const response = await ragChain.invoke({
      question: trimmedQuery,
    });

    // Extract sources (retrieved documents)
    let sources = [];
    try {
      const vectorStore = (await initializeVectorStore()).vectorStore;
      
      if (vectorStore && isInitialized()) {
        const docs = await vectorStore.similaritySearch(trimmedQuery, 3);
        sources = docs.map(doc => ({
          name: doc.name || `${doc.brand || ''} ${doc.name || ''}`,
          brand: doc.brand,
          description: doc.description?.substring(0, 150),
          price: doc.price
        }));
      } else {
        const docs = await retrieveRelevantPerfumes(trimmedQuery, 3);
        sources = docs.map(doc => ({
          name: doc.name || `${doc.brand || ''} ${doc.name || ''}`,
          brand: doc.brand,
          description: doc.description?.substring(0, 150),
          price: doc.price
        }));
      }
    } catch (sourceError) {
      console.warn('⚠️ Could not extract sources:', sourceError.message);
    }

    return {
      success: true,
      answer: response,
      sources: sources,
      query: trimmedQuery,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error processing chat query:', error);
    
    // Return error response
    return {
      success: false,
      answer: `I apologize, but I encountered an error while processing your query. Please try rephrasing your question or try again later.`,
      error: error.message,
      query: query,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Health check for RAG system
 */
export async function healthCheck() {
  try {
    const embeddingsReady = !!await initializeEmbeddings();
    const llmReady = !!await initializeLLM();
    const vectorStoreStatus = await initializeVectorStore();
    
    return {
      embeddings: embeddingsReady,
      llm: llmReady,
      vectorStore: vectorStoreStatus.isInitialized,
      ragInitialized: isRAGInitialized
    };
  } catch (error) {
    return {
      embeddings: false,
      llm: false,
      vectorStore: false,
      ragInitialized: false,
      error: error.message
    };
  }
}

export default {
  initializeLLM,
  initializeRAG,
  processChatQuery,
  healthCheck
};

