import express from "express";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { runRAG } from "./ragService.js";
import mongoose from "mongoose";

const router = express.Router();

// ─── Nearby shop keyword detection ───────────────────────────────────────────
// If user's message contains any of these, we set showNearbyMap: true in the
// response so the frontend knows to render <NearbyShopsMap />.
const NEARBY_TRIGGERS = [
    // English
    "nearby", "near me", "close by", "around me", "in my area",
    "find shop", "perfume shop", "perfume store", "fragrance shop",
    "fragrance store", "where to buy", "where can i buy", "buy perfume",
    "attar shop", "ittar shop", "oud shop", "scent shop", "cologne shop",
    "perfumery", "nearest perfume", "local shop", "shop near",
    // Tamil
    "அருகில்", "கடை", "வாசனை கடை", "பர்ஃபியூம்",
    // Hindi
    "नज़दीक", "इत्र", "सुगंध", "पास में", "दुकान",
];

function detectNearbyIntent(query = "") {
    const lower = query.toLowerCase();
    return NEARBY_TRIGGERS.some((kw) => lower.includes(kw.toLowerCase()));
}

// ─── POST /api/ai/ask ────────────────────────────────────────────────────────
router.post("/ask", async (req, res) => {
    try {
        const { query, sessionId, userId } = req.body;

        // 1. Validate Query
        if (!query || typeof query !== "string" || !query.trim()) {
            return res.status(400).json({ error: "Query is required." });
        }

        // 2. Detect nearby shop intent BEFORE running RAG
        const showNearbyMap = detectNearbyIntent(query.trim());

        let session;

        // 3. Resolve Session
        if (sessionId) {
            if (!mongoose.Types.ObjectId.isValid(sessionId)) {
                return res.status(400).json({ error: "Invalid Session ID format." });
            }
            session = await ChatSession.findById(sessionId);
            if (!session) {
                return res.status(404).json({ error: "Session not found." });
            }
        } else {
            if (!userId) {
                return res.status(400).json({ error: "UserId is required to start a new session." });
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: "Invalid User ID format." });
            }
            try {
                session = await ChatSession.create({
                    userId,
                    title: query.trim().substring(0, 40) + (query.length > 40 ? "..." : ""),
                });
                console.log(`New Maestro session created: ${session._id} for user: ${userId}`);
            } catch (sessionErr) {
                console.error("Session Creation Error:", sessionErr);
                return res.status(500).json({ error: "Failed to create chat session." });
            }
        }

        // 4. Save User Message
        try {
            await ChatMessage.create({
                sessionId: session._id,
                role: "user",
                content: query.trim(),
            });
            console.log(`[Message Saved] role: user, session: ${session._id}`);
        } catch (msgErr) {
            console.error("Save User Message Error:", msgErr);
            return res.status(500).json({ error: "Failed to save message." });
        }

        // 5. Retrieve Context (History)
        let conversationHistory = [];
        try {
            const historyDocs = await ChatMessage.find({ sessionId: session._id })
                .sort({ createdAt: 1 })
                .limit(20);
            conversationHistory = historyDocs.map((doc) => ({
                role: doc.role,
                content: doc.content,
            }));
        } catch (histErr) {
            console.warn("History Fetch Error (non-fatal):", histErr);
        }

        // 6. Run RAG
        let answer;
        try {
            answer = await runRAG(query.trim(), conversationHistory);
        } catch (ragErr) {
            console.error("RAG Service Error:", ragErr);
            answer =
                "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
        }

        // 7. If nearby intent detected, append a helpful note to the AI answer
        if (showNearbyMap) {
            answer =
                answer +
                "\n\nHere are some of the best perfume shops near you. Please ensure your location is enabled.";
        }

        // 8. Save AI Response
        try {
            await ChatMessage.create({
                sessionId: session._id,
                role: "assistant",
                content: answer,
                showNearbyMap, // ← SAVE the flag
            });
            console.log(`[Message Saved] role: assistant, session: ${session._id}, map: ${showNearbyMap}`);
        } catch (saveAiErr) {
            console.error("Save AI Response Error:", saveAiErr);
        }

        // 9. Update Session Timestamp
        await ChatSession.findByIdAndUpdate(session._id, { updatedAt: new Date() }).catch((err) =>
            console.error("Session Update Error:", err)
        );

        // 10. Return Response — showNearbyMap tells frontend to render the map component
        res.json({
            answer,
            sessionId: session._id,
            title: session.title,
            showNearbyMap, // ← NEW: boolean flag for the frontend
        });

    } catch (err) {
        console.error("RAG Route Critical Error:", err);
        res.status(500).json({ error: "An unexpected error occurred. Please try again." });
    }
});

// ─── GET /api/ai/sessions/:userId ────────────────────────────────────────────
router.get("/sessions/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid User ID" });
        }
        const sessions = await ChatSession.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(50);
        res.json(sessions);
    } catch (err) {
        console.error("Get Sessions Error:", err);
        res.status(500).json({ error: "Failed to fetch sessions" });
    }
});

// ─── GET /api/ai/sessions/chat/:sessionId ────────────────────────────────────
router.get("/sessions/chat/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ error: "Invalid Session ID" });
        }
        const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
        const formatted = messages.map((m) => ({
            id: m._id,
            role: m.role,
            text: m.content,
            showNearbyMap: m.showNearbyMap || false, // ← RETURN the flag
            createdAt: m.createdAt,
        }));
        res.json(formatted);
    } catch (err) {
        console.error("Get Chat History Error:", err);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

// ─── DELETE /api/ai/sessions/:sessionId ───────────────────────────────────────
router.delete("/sessions/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ error: "Invalid Session ID" });
        }
        await ChatMessage.deleteMany({ sessionId });
        const deleted = await ChatSession.findByIdAndDelete(sessionId);
        if (!deleted) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ success: true, message: "Session deleted successfully" });
    } catch (err) {
        console.error("Delete Session Error:", err);
        res.status(500).json({ error: "Failed to delete session" });
    }
});

// ─── GET /api/ai/health ──────────────────────────────────────────────────────
router.get("/health", async (req, res) => {
    try {
        const db = mongoose.connection.db;
        if (!db) return res.json({ status: "error", message: "MongoDB not connected" });

        const collection = db.collection("fragrance_data");
        const totalDocs = await collection.countDocuments();
        const docsWithEmbeddings = await collection.countDocuments({ embedding: { $exists: true } });
        const docsWithRagText = await collection.countDocuments({ rag_text: { $exists: true } });
        const sample = await collection.findOne({}, { projection: { embedding: 0 } });

        res.json({
            status: "ok",
            database: db.databaseName,
            collection: "fragrance_data",
            totalDocuments: totalDocs,
            documentsWithEmbeddings: docsWithEmbeddings,
            documentsWithRagText: docsWithRagText,
            vectorSearchReady: docsWithEmbeddings > 0,
            sampleDocumentFields: sample ? Object.keys(sample) : [],
        });
    } catch (err) {
        console.error("Health Check Error:", err);
        res.status(500).json({ status: "error", error: err.message });
    }
});

// ─── POST /api/ai/blend ──────────────────────────────────────────────────────
router.post("/blend", async (req, res) => {
    try {
        const { notes } = req.body;
        if (!notes || !Array.isArray(notes) || notes.length === 0) {
            return res.status(400).json({ error: "Please select at least one note." });
        }

        const db = mongoose.connection.db;
        if (!db) return res.status(500).json({ error: "Database not connected." });

        const collection = db.collection("fragrance_data");
        const noteRegexes = notes.map(
            (n) => new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        );

        const noteConditions = noteRegexes.flatMap((regex) => [
            { "notes_pyramid.top": { $elemMatch: { $regex: regex } } },
            { "notes_pyramid.middle": { $elemMatch: { $regex: regex } } },
            { "notes_pyramid.base": { $elemMatch: { $regex: regex } } },
        ]);
        const ragTextConditions = noteRegexes.map((regex) => ({ rag_text: { $regex: regex } }));
        const allConditions = [...noteConditions, ...ragTextConditions];

        const pipeline = [
            { $match: { $or: allConditions } },
            {
                $addFields: {
                    _allNotes: {
                        $map: {
                            input: {
                                $concatArrays: [
                                    { $ifNull: ["$notes_pyramid.top", []] },
                                    { $ifNull: ["$notes_pyramid.middle", []] },
                                    { $ifNull: ["$notes_pyramid.base", []] },
                                ],
                            },
                            as: "n",
                            in: { $toLower: "$$n" },
                        },
                    },
                },
            },
            {
                $addFields: {
                    _matchCount: {
                        $size: {
                            $filter: {
                                input: notes.map((n) => n.toLowerCase()),
                                as: "userNote",
                                cond: {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$_allNotes",
                                                    as: "dbNote",
                                                    cond: {
                                                        $regexMatch: {
                                                            input: "$$dbNote",
                                                            regex: { $concat: [".*", "$$userNote", ".*"] },
                                                            options: "i",
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            { $sort: { _matchCount: -1, "ratings.average_rating": -1 } },
            { $limit: 10 },
            {
                $project: {
                    name: 1, brand: 1, accords: 1, notes_pyramid: 1,
                    "images.primary": 1, "ratings.average_rating": 1,
                    "ratings.total_votes": 1, "pricing.price_value": 1,
                    "pricing.currency": 1, "identity.gender": 1,
                    "identity.type": 1, "performance.longevity": 1,
                    "performance.sillage": 1, description: 1, _matchCount: 1,
                },
            },
        ];

        const results = await collection.aggregate(pipeline).toArray();

        const PROSE_WORDS =
            /\b(and|the|of|with|for|creates?|adds?|brings?|introduces?|leaving|behind|smooth|warmth|depth|modern|vibrant|graceful|mysterious|confident|easy|delicacy|juicy|creamy|rich)\b/i;
        const isCleanAccord = (a) => {
            if (!a || typeof a !== "string") return false;
            const trimmed = a.trim();
            const lower = trimmed.toLowerCase();
            if (lower.length < 2 || lower.length > 22) return false;
            if (/https?:|\.jpg|\.png|\.webp/.test(lower)) return false;
            if (/perfume|notes|base:|heart:|top:|middle:|bottle|spray/i.test(lower)) return false;
            if (/\d{2,}/.test(lower)) return false;
            if (trimmed.split(/\s+/).length > 3) return false;
            if (PROSE_WORDS.test(lower)) return false;
            return true;
        };

        const accordCounts = {};
        results.forEach((doc) => {
            const weight = doc._matchCount || 1;
            (doc.accords || []).forEach((accord) => {
                const a = accord.trim().toLowerCase();
                if (isCleanAccord(a)) accordCounts[a] = (accordCounts[a] || 0) + weight;
            });
        });

        const blendAccords = Object.entries(accordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name, strength: count }));

        const cleanNotes = (notesObj) => {
            if (!notesObj) return null;
            const clean = (arr) =>
                (arr || []).filter(
                    (n) => typeof n === "string" && n.length < 40 && !n.includes("perfume") && !n.includes("http")
                );
            return { top: clean(notesObj.top), middle: clean(notesObj.middle), base: clean(notesObj.base) };
        };

        res.json({
            matchingPerfumes: results.map((doc) => ({
                id: doc._id,
                name: doc.name,
                brand: doc.brand,
                accords: [...new Set((doc.accords || []).filter(isCleanAccord).map((a) => a.trim().toLowerCase()))],
                notes: cleanNotes(doc.notes_pyramid),
                image: doc.images?.primary || null,
                rating: doc.ratings?.average_rating || null,
                votes: doc.ratings?.total_votes || null,
                price: doc.pricing?.price_value || null,
                currency: doc.pricing?.currency || null,
                gender: doc.identity?.gender || null,
                type: doc.identity?.type || null,
                longevity: typeof doc.performance?.longevity === "string" ? doc.performance.longevity : null,
                sillage: typeof doc.performance?.sillage === "string" ? doc.performance.sillage : null,
                matchScore: doc._matchCount,
            })),
            blendAccords,
            totalMatches: results.length,
            selectedNotes: notes,
        });
    } catch (err) {
        console.error("Blend API Error:", err);
        res.status(500).json({ error: "Failed to compute blend." });
    }
});

export default router;