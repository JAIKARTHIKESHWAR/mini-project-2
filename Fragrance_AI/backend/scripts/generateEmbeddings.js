import dns from 'dns';
// Force public DNS (fixes SRV lookup failures on restricted networks)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createEmbedding } from '../ai/embedder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure env vars are loaded
dotenv.config({ path: join(__dirname, '../../.env') });

const BATCH_SIZE = 20;
const DELAY_MS = 500; // Delay between batches to avoid rate limits

/**
 * Build a rich text string from a document for embedding.
 * Uses the ACTUAL flat schema fields from the fragrance_data collection.
 */
function buildRagText(doc) {
    const parts = [];
    if (doc.brand) parts.push(`Brand: ${doc.brand}`);
    if (doc.name) parts.push(`Name: ${doc.name}`);
    if (doc.description) parts.push(`Description: ${doc.description}`);
    if (doc.productType) parts.push(`Type: ${doc.productType}`);
    if (doc.gender) parts.push(`Gender: ${doc.gender}`);
    if (doc.fragranceFamily) parts.push(`Fragrance Family: ${doc.fragranceFamily}`);
    if (doc.character) parts.push(`Character: ${doc.character}`);
    if (doc.concentration) parts.push(`Concentration: ${doc.concentration}`);

    // Notes
    if (doc.topNotes?.length) parts.push(`Top Notes: ${doc.topNotes.join(", ")}`);
    if (doc.middleNotes?.length) parts.push(`Middle Notes: ${doc.middleNotes.join(", ")}`);
    if (doc.baseNotes?.length) parts.push(`Base Notes: ${doc.baseNotes.join(", ")}`);
    if (doc.notes?.length) parts.push(`All Notes: ${doc.notes.join(", ")}`);
    if (doc.ingredients?.length) parts.push(`Ingredients: ${doc.ingredients.join(", ")}`);

    // Performance
    if (doc.longevity) parts.push(`Longevity: ${doc.longevity}`);
    if (doc.sillage) parts.push(`Sillage: ${doc.sillage}`);
    if (doc.intensity) parts.push(`Intensity: ${doc.intensity}`);

    // Usage
    if (doc.season?.length) parts.push(`Season: ${doc.season.join(", ")}`);
    if (doc.occasion?.length) parts.push(`Occasion: ${doc.occasion.join(", ")}`);

    // Tags
    if (doc.tags?.length) parts.push(`Tags: ${doc.tags.join(", ")}`);

    // Pricing
    if (doc.price) parts.push(`Price: Rs.${doc.price} INR`);

    // Rating
    if (doc.rating) parts.push(`Rating: ${doc.rating}/5`);
    if (doc.ratingCount) parts.push(`Reviews: ${doc.ratingCount}`);

    // Year
    if (doc.year) parts.push(`Year: ${doc.year}`);

    return parts.join(". ");
}

async function generateEmbeddings() {
    console.log("🚀 Starting Embedding Generation Script...");

    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is missing in .env");
        process.exit(1);
    }

    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ OPENAI_API_KEY is missing in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'fragrance' });
        console.log("✅ MongoDB Connected");
        console.log("📊 Database:", mongoose.connection.db.databaseName);

        const collection = mongoose.connection.collection("fragrance_data");

        const total = await collection.countDocuments();
        console.log(`📊 Total documents in fragrance_data: ${total}`);

        // Find documents that DON'T have an embedding yet
        const needsEmbedding = await collection.countDocuments({ embedding: { $exists: false } });
        console.log(`📊 Documents needing embeddings: ${needsEmbedding}`);

        if (needsEmbedding === 0) {
            console.log("✅ All documents already have embeddings!");
            
            // Optionally regenerate rag_text for all docs
            const needsRagText = await collection.countDocuments({ rag_text: { $exists: false } });
            if (needsRagText > 0) {
                console.log(`📊 ${needsRagText} docs need rag_text. Generating...`);
                const docs = await collection.find({ rag_text: { $exists: false } }).toArray();
                const ops = docs.map(doc => ({
                    updateOne: {
                        filter: { _id: doc._id },
                        update: { $set: { rag_text: buildRagText(doc) } }
                    }
                }));
                if (ops.length > 0) {
                    await collection.bulkWrite(ops);
                    console.log(`✅ Updated rag_text for ${ops.length} documents`);
                }
            }
            
            process.exit(0);
        }

        let processed = 0;
        let failed = 0;

        while (processed + failed < needsEmbedding) {
            const batch = await collection.find({ embedding: { $exists: false } })
                .limit(BATCH_SIZE)
                .toArray();

            if (batch.length === 0) break;

            console.log(`\n📦 Processing batch of ${batch.length} documents (${processed + failed}/${needsEmbedding})...`);

            const updates = [];
            for (const doc of batch) {
                try {
                    // Build rag_text from actual document fields
                    let text = doc.rag_text || buildRagText(doc);

                    if (!text || text.trim().length === 0) {
                        console.warn(`  ⚠️ Skipping doc ${doc._id} (${doc.name}) — empty text`);
                        failed++;
                        continue;
                    }

                    const embedding = await createEmbedding(text);

                    updates.push({
                        updateOne: {
                            filter: { _id: doc._id },
                            update: { $set: { embedding: embedding, rag_text: text } }
                        }
                    });

                    console.log(`  ✅ ${doc.brand} - ${doc.name}`);
                } catch (err) {
                    console.error(`  ❌ Failed: ${doc.name} — ${err.message}`);
                    failed++;
                }
            }

            if (updates.length > 0) {
                await collection.bulkWrite(updates);
                processed += updates.length;
                console.log(`📊 Progress: ${processed} embedded, ${failed} failed, ${needsEmbedding - processed - failed} remaining`);
            }

            // Rate limit protection
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }

        console.log(`\n🎉 Embedding generation complete!`);
        console.log(`   ✅ Successfully embedded: ${processed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📊 Total with embeddings: ${await collection.countDocuments({ embedding: { $exists: true } })}`);

        process.exit(0);

    } catch (err) {
        console.error("❌ Script failed:", err);
        process.exit(1);
    }
}

generateEmbeddings();
