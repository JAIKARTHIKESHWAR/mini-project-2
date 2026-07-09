import dns from 'dns';
// Force public DNS (fixes SRV lookup failures on restricted networks)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import mongoose from "mongoose";
import { createEmbedding } from "./embedder.js";

// ── Shared projection for all search methods ────────────────────────────────
const PROJECTION = {
    name: 1, brand: 1, description: 1,
    identity: 1, pricing: 1, notes_pyramid: 1, accords: 1,
    performance: 1, usage: 1, ratings: 1, images: 1, source: 1, metadata: 1,
    price: 1, gender: 1, productType: 1, character: 1, fragranceFamily: 1,
    concentration: 1, size: 1, year: 1,
    notes: 1, topNotes: 1, middleNotes: 1, baseNotes: 1, ingredients: 1,
    longevity: 1, sillage: 1, intensity: 1,
    season: 1, occasion: 1,
    rating: 1, ratingCount: 1, tags: 1, imageUrl: 1, rag_text: 1,
};

// Fields to search across (ordered by priority)
const SEARCHABLE_FIELDS = [
    "name", "brand", "rag_text", "description",
    "tags", "accords",
    "notes_pyramid.top", "notes_pyramid.middle", "notes_pyramid.base",
    "usage.mood", "usage.season", "usage.occasion",
    "fragranceFamily", "character",
    "notes", "topNotes", "middleNotes", "baseNotes",
];

const STOP_WORDS = new Set([
    "the", "and", "for", "that", "with", "about", "what", "tell", "show",
    "find", "recommend", "suggest", "give", "want", "need", "like", "looking",
    "something", "which", "best", "good", "nice", "great", "any", "some",
    "please", "can", "you", "help", "me", "my", "your", "this", "from",
    "have", "has", "its", "are", "was", "were", "been", "being", "more",
    "also", "too", "very", "really", "just", "use", "using", "know",
]);

function extractKeywords(query) {
    return query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

/**
 * Build a regex $or condition for ONE keyword across all searchable fields.
 */
function buildOrForKeyword(kw) {
    return SEARCHABLE_FIELDS.map(field => ({ [field]: { $regex: kw, $options: "i" } }));
}

/**
 * FAST regex search — primary search method.
 * 
 * STRATEGY:
 * 1. If multiple keywords → try AND matching first (all keywords must match)
 *    This ensures "Versace Eros" finds perfumes with BOTH words, not "tuberose".
 * 2. If AND returns nothing → fall back to OR matching
 * 3. Always prioritize name/brand matches
 */
async function regexSearch(collection, query, limit = 5) {
    const start = Date.now();
    const keywords = extractKeywords(query);

    if (keywords.length === 0) {
        return collection.find({})
            .project(PROJECTION)
            .sort({ "ratings.average_rating": -1, rating: -1 })
            .limit(limit)
            .toArray();
    }

    let results = [];

    // === Phase 1: AND matching (all keywords must appear somewhere in the document) ===
    if (keywords.length >= 2) {
        // Each keyword must match at least one searchable field
        const andConditions = keywords.map(kw => ({
            $or: buildOrForKeyword(kw)
        }));

        results = await collection.find({ $and: andConditions })
            .project(PROJECTION)
            .limit(limit)
            .toArray();

        if (results.length > 0) {
            console.log(`   ⚡ Regex AND: ${results.length} results in ${Date.now() - start}ms`);
            return results;
        }
    }

    // === Phase 2: Priority name/brand search ===
    // Try matching any keyword in name or brand first (most precise)
    const nameBrandConditions = keywords.flatMap(kw => [
        { name: { $regex: kw, $options: "i" } },
        { brand: { $regex: kw, $options: "i" } },
    ]);

    results = await collection.find({ $or: nameBrandConditions })
        .project(PROJECTION)
        .sort({ "ratings.average_rating": -1, rating: -1 })
        .limit(limit)
        .toArray();

    if (results.length > 0) {
        console.log(`   ⚡ Regex name/brand: ${results.length} results in ${Date.now() - start}ms`);
        return results;
    }

    // === Phase 3: Broad OR matching across all fields ===
    const orConditions = keywords.flatMap(kw => buildOrForKeyword(kw));

    results = await collection.find({ $or: orConditions })
        .project(PROJECTION)
        .sort({ "ratings.average_rating": -1, rating: -1 })
        .limit(limit)
        .toArray();

    console.log(`   ⚡ Regex OR: ${results.length} results in ${Date.now() - start}ms`);
    return results;
}

/**
 * Vector search with OpenAI embeddings.
 * SLOWER — external API call for embedding. Only used when regex finds nothing.
 * Has a hard timeout to prevent hanging.
 */
async function vectorSearchWithTimeout(collection, query, limit = 4, timeoutMs = 12000) {
    return new Promise(async (resolve) => {
        const timer = setTimeout(() => {
            console.warn(`   ⏰ Vector search timed out after ${timeoutMs}ms — skipping`);
            resolve([]);
        }, timeoutMs);

        try {
            const embStart = Date.now();
            const queryVector = await createEmbedding(query);
            console.log(`   ⚡ Embedding: ${Date.now() - embStart}ms`);

            const searchStart = Date.now();
            const vectorResults = await collection.aggregate([
                {
                    $vectorSearch: {
                        index: "fragrance_index",
                        path: "embedding",
                        queryVector: queryVector,
                        numCandidates: 100,
                        limit: limit,
                    },
                },
                {
                    $project: {
                        ...PROJECTION,
                        score: { $meta: "vectorSearchScore" },
                    },
                },
            ]).toArray();

            clearTimeout(timer);
            const filtered = vectorResults.filter(doc => (doc.score || 0) > 0.15); // Lowered threshold for broader semantic match
            console.log(`   ⚡ Vector DB: ${Date.now() - searchStart}ms (${filtered.length}/${vectorResults.length} above threshold)`);
            resolve(filtered);
        } catch (err) {
            clearTimeout(timer);
            console.warn(`   ⚠️ Vector search error: ${err.message}`);
            resolve([]);
        }
    });
}

/**
 * Main retrieval function.
 * 
 * STRATEGY (fast-first):
 * 1. Always run regex search FIRST (instant, <200ms, no external API)
 * 2. If regex finds good results → use them immediately
 * 3. If regex finds nothing → try vector search with a 12s timeout
 */
export async function retrieveRelevantDocs(query) {
    const totalStart = Date.now();

    try {
        const db = mongoose.connection.db;
        if (!db) throw new Error("MongoDB not connected.");

        const collection = db.collection("fragrance_data");

        // === STEP 1: Fast regex search (always first) ===
        console.log("🔍 Running fast regex search...");
        const regexResults = await regexSearch(collection, query, 5);

        if (regexResults.length >= 3) { // Require at least 3 keyword matches before skipping vector search
            console.log(`✅ Retriever: ${regexResults.length} docs via [regex] in ${Date.now() - totalStart}ms`);
            return regexResults;
        }

        // === STEP 2: No regex results OR too few → try vector search ===
        console.log("🔍 Trying vector search for better semantic coverage...");
        const vectorResults = await vectorSearchWithTimeout(collection, query, 6, 12000);

        // Merge results (favoring regex matches at the top)
        const seen = new Set(regexResults.map(d => d._id.toString()));
        const merged = [...regexResults];

        for (const doc of vectorResults) {
            if (!seen.has(doc._id.toString())) {
                merged.push(doc);
                seen.add(doc._id.toString());
            }
        }

        if (merged.length > 0) {
            console.log(`✅ Retriever: ${merged.length} docs [merged] in ${Date.now() - totalStart}ms`);
            return merged.slice(0, 8); // Return top 8 results
        }

        // === STEP 3: Nothing found ===
        console.log(`⚠️ Retriever: 0 docs in ${Date.now() - totalStart}ms for: "${query.substring(0, 50)}"`);
        return [];

    } catch (error) {
        console.error(`❌ Retriever error: ${error.message}`);
        return [];
    }
}
