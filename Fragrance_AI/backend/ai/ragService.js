import { retrieveRelevantDocs } from "./retriever.js";
import { generateResponse } from "./generator.js";

// Keywords that indicate a greeting/casual conversation (skip DB search)
const GREETING_KEYWORDS = [
    "hi", "hello", "hey", "hiya", "howdy", "good morning", "good evening",
    "good afternoon", "what's up", "sup", "greetings", "who are you",
    "what are you", "what can you do", "tell me about yourself",
    "how can you help", "how do you help", "how would you help",
    "what do you do", "introduce yourself", "tell me about you",
];

// Keywords that are explicitly NON-fragrance (skip DB search)
const OFF_TOPIC_KEYWORDS = [
    "weather", "stock market", "politics", "football", "cricket", "code",
    "programming", "recipe", "cook", "math", "history of india"
];

// Keywords for celebrity/general knowledge that should skip DB search
const GENERAL_KNOWLEDGE_KEYWORDS = [
    // Celebrity queries
    "shah rukh khan", "srk", "salman khan", "virat kohli", "celebrity",
    "actor", "actress", "bollywood", "hollywood", "famous person", "who wears",
    "what perfume does", "what fragrance does", "what cologne does",
    // General world knowledge
    "best perfume in the world", "top 10", "top 5", "most popular perfume",
    "most expensive perfume", "history of", "invented by", "who created",
    "what is oud", "what is attar", "what is eau de", "difference between",
    "explain", "define", "meaning of",
];

// Stronger celebrity pattern check
function isGeneralKnowledgeQuery(query) {
    const lower = query.toLowerCase();
    
    // Pattern: "what perfume/fragrance/cologne does [anyone] use/wear/like"
    if (/what (perfume|fragrance|cologne|scent|attar).*(use|wear|like|prefer)/i.test(query)) return true;
    if (/what does .* (wear|use|smell|like)/i.test(query)) return true;
    if (/(famous|popular|best|top|most) (scent|perfume|fragrance|cologne|attar)/i.test(lower)) return true;
    if (/(actor|actress|celebrity|stars|bollywood|hollywood).* (use|wear|like|prefer|scent|perfume|fragrance)/i.test(lower)) return true;
    if (/(which|what) .* (famous|popular).* (scent|perfume|fragrance)/i.test(lower)) return true;
    
    return GENERAL_KNOWLEDGE_KEYWORDS.some(kw => lower.includes(kw));
}

// Decline / no-thanks phrases (skip DB search — answer locally)
const DECLINE_KEYWORDS = [
    "no thanks", "no thank you", "nope", "not now", "maybe later",
    "that's okay", "thats okay", "i'm good", "im good", "no need",
    "not interested", "skip it", "no, thanks", "no, thank you",
];

/**
 * Determine if we should skip the database search entirely.
 * Only skip for pure greetings, clearly off-topic queries, or declines.
 */
function shouldSkipSearch(query) {
    const lowerQuery = query.toLowerCase().trim();

    const isGreeting = GREETING_KEYWORDS.some(kw =>
        lowerQuery === kw || lowerQuery.startsWith(kw + " ") || lowerQuery.endsWith(" " + kw) || lowerQuery.includes(kw)
    );
    if (isGreeting && lowerQuery.length < 60) return true;

    const isDecline = DECLINE_KEYWORDS.some(kw => lowerQuery === kw || lowerQuery.startsWith(kw));
    if (isDecline) return true;

    const isOffTopic = OFF_TOPIC_KEYWORDS.some(kw => lowerQuery.includes(kw));
    if (isOffTopic && lowerQuery.length < 40) return true;

    if (isGeneralKnowledgeQuery(query)) return true; // skip DB, let GPT answer from own knowledge

    return false;
}

// Stronger guard for clearly non‑fragrance topics — used to short‑circuit RAG
function isClearlyNonFragrance(query) {
    const lowerQuery = query.toLowerCase();
    return OFF_TOPIC_KEYWORDS.some(kw => lowerQuery.includes(kw));
}


export async function runRAG(query, conversationHistory = []) {
    const totalStart = Date.now();

    try {
        let docs = [];

        // Hard guard against non‑fragrance topics to avoid off‑domain hallucinations
        if (isClearlyNonFragrance(query)) {
            return "I'm designed specifically to help with perfumes and fragrances. Please ask me something related to scents, perfumes, or fragrance choices.";
        }

        if (!shouldSkipSearch(query)) {
            const retrieveStart = Date.now();
            try {
                docs = await retrieveRelevantDocs(query);
            } catch (retrieveErr) {
                console.error(`⚠️ Retrieval error after ${Date.now() - retrieveStart}ms:`, retrieveErr.message);
                docs = [];
            }
            console.log(`📚 Retrieval: ${docs.length} docs in ${Date.now() - retrieveStart}ms`);
        } else {
            console.log(`⏭️ Skipping DB search (greeting/off-topic)`);
        }

        const genStart = Date.now();
        const answer = await generateResponse(query, docs, conversationHistory);
        console.log(`💬 Generation: ${Date.now() - genStart}ms`);

        const totalMs = Date.now() - totalStart;
        console.log(`✅ RAG total: ${totalMs}ms for "${query.substring(0, 40)}..."`);

        return answer;

    } catch (error) {
        console.error(`❌ RAG error after ${Date.now() - totalStart}ms:`, error.message);
        throw error;
    }
}
