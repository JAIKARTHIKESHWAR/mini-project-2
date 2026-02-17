import { retrieveRelevantDocs } from "./retriever.js";
import { generateResponse } from "./generator.js";

// Keywords that indicate a greeting/casual conversation (skip DB search)
const GREETING_KEYWORDS = [
    "hi", "hello", "hey", "hiya", "howdy", "good morning", "good evening",
    "good afternoon", "what's up", "sup", "greetings", "who are you",
    "what are you", "what can you do", "tell me about yourself"
];

// Keywords that are explicitly NON-fragrance (skip DB search)
const OFF_TOPIC_KEYWORDS = [
    "weather", "stock market", "politics", "football", "cricket", "code",
    "programming", "recipe", "cook", "math", "history of india"
];

/**
 * Determine if we should skip the database search entirely.
 * Only skip for pure greetings or clearly off-topic queries.
 */
function shouldSkipSearch(query) {
    const lowerQuery = query.toLowerCase().trim();

    const isGreeting = GREETING_KEYWORDS.some(kw =>
        lowerQuery === kw || lowerQuery.startsWith(kw + " ") || lowerQuery.endsWith(" " + kw)
    );
    if (isGreeting && lowerQuery.length < 30) return true;

    const isOffTopic = OFF_TOPIC_KEYWORDS.some(kw => lowerQuery.includes(kw));
    if (isOffTopic && lowerQuery.length < 40) return true;

    return false;
}

export async function runRAG(query, conversationHistory = []) {
    const totalStart = Date.now();

    try {
        let docs = [];

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
