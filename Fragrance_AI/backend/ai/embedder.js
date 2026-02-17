import { openai } from "./openaiClient.js";

/**
 * Create an embedding vector for the given text.
 * Uses text-embedding-3-large (3072 dims) to match stored embeddings.
 * Includes timeout + timing for diagnostics.
 */
export async function createEmbedding(text) {
    const start = Date.now();
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: text,
        });

        const ms = Date.now() - start;
        console.log(`   ⚡ Embedding generated in ${ms}ms (${response.data[0].embedding.length} dims)`);
        return response.data[0].embedding;
    } catch (error) {
        const ms = Date.now() - start;
        console.error(`   ❌ Embedding failed after ${ms}ms:`, error.message || error);

        // If it's a timeout or network error, throw a clear message
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            throw new Error(`OpenAI embedding timed out after ${ms}ms. Check your API key and network.`);
        }
        if (error.status === 401) {
            throw new Error("OpenAI API key is invalid or expired. Check OPENAI_API_KEY in .env");
        }
        if (error.status === 429) {
            throw new Error("OpenAI rate limit exceeded. Wait a moment and try again.");
        }
        throw error;
    }
}
