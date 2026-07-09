import dns from 'dns';
// Force public DNS (fixes SRV lookup failures on restricted networks)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { retrieveRelevantDocs } from '../ai/retriever.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// === CONFIGURATION & TEST SET ===

const TEST_QUERIES = [
    { query: "Find me something from Versace", expectedBrand: "Versace", category: "Brand" },
    { query: "Looking for Dior Sauvage", expectedName: "Sauvage", expectedBrand: "Dior", category: "Direct Match" },
    { query: "I want a perfume with vanilla and lavender notes", expectedNotes: ["vanilla", "lavender"], category: "Note-based" },
    { query: "Recommend a fresh citrus scent for summer", expectedTags: ["fresh", "citrus", "summer"], category: "Vague/Descriptive" },
    { query: "Chanel No 5", expectedName: "No 5", expectedBrand: "Chanel", category: "Direct Match" },
    { query: "Heavy oud and leather for winter", expectedNotes: ["oud", "leather"], category: "Note-based" },
    { query: "Best floral perfume for women", expectedTags: ["floral"], category: "Vague/Descriptive" },
    { query: "Tom Ford Tobacco Vanille", expectedName: "Tobacco Vanille", expectedBrand: "Tom Ford", category: "Direct Match" }
];

// === UTILS ===

function drawBar(value, max = 1, length = 20) {
    const filledLength = Math.round((value / max) * length);
    const bar = "█".repeat(filledLength) + "░".repeat(length - filledLength);
    const percentage = (value * 100).toFixed(1) + "%";
    return `${bar} ${percentage}`;
}

function classifyQuery(query) {
    const q = query.toLowerCase();
    if (q.includes("recommend") || q.includes("find something") || q.includes("best")) return "Vague/Descriptive";
    if (q.includes("with") || q.includes("notes") || q.includes("smell like")) return "Note-based";
    return "Direct/Brand Search";
}

// === EVALUATION LOGIC ===

async function evaluate() {
    console.log("\n🚀 Starting AI Accuracy Evaluation (Target: >80%)...\n");
    
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        const testResults = [];
        let hits = 0;

        for (const test of TEST_QUERIES) {
            process.stdout.write(`🔍 Testing: "${test.query}"... `);
            const start = Date.now();
            const retrieved = await retrieveRelevantDocs(test.query);
            const duration = Date.now() - start;

            // HIT RATE MEASUREMENT: Did we find at least one relevant document?
            let isHit = false;
            let matchDetails = [];

            retrieved.forEach(doc => {
                const docName = (doc.name || "").toLowerCase();
                const docBrand = (doc.brand || "").toLowerCase();
                const docText = (doc.rag_text || doc.description || "").toLowerCase();
                
                let docIsRelevant = false;

                // 1. Exact Brand match or Brand found in Name (handles data issues where brand is mislabeled)
                if (test.expectedBrand) {
                    const brand = test.expectedBrand.toLowerCase().replace(/[.]/g, "");
                    if (docBrand.includes(brand) || docName.includes(brand)) docIsRelevant = true;
                }
                
                // 2. Name match (robust)
                if (test.expectedName) {
                    const target = test.expectedName.toLowerCase().replace(/[.]/g, "");
                    if (docName.includes(target)) docIsRelevant = true;
                }

                // 3. Notes match
                if (test.expectedNotes) {
                    if (test.expectedNotes.some(note => docText.includes(note.toLowerCase()))) docIsRelevant = true;
                }

                // 4. Tags match
                if (test.expectedTags) {
                    if (test.expectedTags.some(tag => docText.includes(tag.toLowerCase()))) docIsRelevant = true;
                }

                if (docIsRelevant) {
                    isHit = true;
                    matchDetails.push(doc.name);
                }
            });

            if (isHit) hits++;

            testResults.push({
                ...test,
                isHit,
                matchCount: matchDetails.length,
                matches: matchDetails.slice(0, 2),
                retrievedCount: retrieved.length,
                duration
            });

            console.log(isHit ? `✅ HIT (${duration}ms)` : `❌ MISS (${duration}ms)`);
        }

        // === REPORT GENERATION ===

        const overallAccuracy = (hits / TEST_QUERIES.length) * 100;
        
        console.log("\n" + "=".repeat(60));
        console.log("📊 AI SYSTEM ACCURACY REPORT");
        console.log("=".repeat(60));

        console.log(`\nOVERALL HIT RATE (ACCURACY):`);
        console.log(drawBar(overallAccuracy / 100));

        // Group by category
        const categories = [...new Set(testResults.map(r => r.category))];
        console.log(`\nACCURACY BY CATEGORY:`);
        categories.forEach(cat => {
            const catResults = testResults.filter(r => r.category === cat);
            const catHits = catResults.filter(r => r.isHit).length;
            const catAcc = (catHits / catResults.length);
            console.log(`${cat.padEnd(20)}: ${drawBar(catAcc)}`);
        });

        console.log(`\nLATENCY SUMMARY:`);
        const argDuration = testResults.reduce((sum, r) => sum + r.duration, 0) / testResults.length;
        console.log(`Avg Response Time   : ${argDuration.toFixed(0)}ms`);

        console.log(`\nDETAILED LOG:`);
        testResults.forEach(r => {
            const status = r.isHit ? "✅" : "❌";
            console.log(`${status} [${r.category}] "${r.query}"`);
            if (r.isHit) {
                console.log(`   Found: ${r.matches.join(", ")}${r.matchCount > 2 ? "..." : ""}`);
            } else {
                console.log(`   Found 0 relevant out of ${r.retrievedCount} returned.`);
            }
        });

        console.log("\n" + "=".repeat(60));
        if (overallAccuracy >= 80) {
            console.log("🌟 TARGET ACHIEVED: Accuracy is above 80%!");
        } else {
            console.log("⚠️ Target not yet reached. Further tuning required.");
        }
        console.log("=".repeat(60) + "\n");

        process.exit(0);
    } catch (err) {
        console.error("\n❌ Evaluation failed:", err);
        process.exit(1);
    }
}

evaluate();
