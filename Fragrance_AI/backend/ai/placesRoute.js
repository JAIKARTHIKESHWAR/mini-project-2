/**
 * placesRoute.js
 *
 * Mount in your main server file:
 *   import placesRouter from "./ai/placesRoute.js";
 *   app.use("/api/places", placesRouter);
 *
 * Endpoints:
 *   GET /api/places/nearby?lat=11.01&lng=76.95   → returns shop list
 *   GET /api/places/detail?placeId=ChIJ...        → returns full place detail
 */

import express from "express";
import fetch from "node-fetch"; // npm i node-fetch  (or use native fetch in Node 18+)

const router = express.Router();

const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY; // add to your backend .env
const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";
const SEARCH_RADIUS = 10000; // metres

// ── Helper: forward fetch errors cleanly ─────────────────────────────────────
async function gFetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google API HTTP ${res.status}`);
    return res.json();
}

// ── Keyword filter: only keep perfume-relevant results from nearbySearch ──────
const PERFUME_TERMS = [
    "perfume", "fragrance", "attar", "ittar", "oud",
    "scent", "cologne", "aroma", "parfum",
];
const isPerfumeRelevant = (r) => {
    const combined = `${r.name || ""} ${r.vicinity || ""}`.toLowerCase();
    return PERFUME_TERMS.some((t) => combined.includes(t));
};

// ── Deduplicate by place_id ───────────────────────────────────────────────────
const dedupe = (arr) => {
    const seen = new Map();
    arr.forEach((r) => { if (!seen.has(r.place_id)) seen.set(r.place_id, r); });
    return [...seen.values()];
};

// ── Normalise a Places API result to a lean object ───────────────────────────
const normalise = (r) => ({
    place_id: r.place_id,
    name: r.name,
    vicinity: r.vicinity || r.formatted_address || "",
    rating: r.rating ?? null,
    user_ratings_total: r.user_ratings_total ?? null,
    open_now: r.opening_hours?.open_now ?? null,
    // photo_reference lets the frontend build a photo URL via /api/places/photo
    photo_reference: r.photos?.[0]?.photo_reference ?? null,
    geometry: {
        lat: r.geometry?.location?.lat ?? null,
        lng: r.geometry?.location?.lng ?? null,
    },
    business_status: r.business_status ?? "OPERATIONAL",
    types: r.types ?? [],
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/places/nearby?lat=&lng=
// Runs textSearch (most reliable) + nearbySearch supplement, merges & returns.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/nearby", async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
            return res.status(400).json({ error: "lat and lng query params are required." });
        }
        if (!MAPS_KEY) {
            return res.status(500).json({ error: "GOOGLE_MAPS_API_KEY not set in server .env" });
        }

        const location = `${lat},${lng}`;
        const all = [];

        // 1. textSearch queries — most accurate for named shops
        const textQueries = ["perfume shop", "fragrance store", "attar shop"];
        for (const q of textQueries) {
            try {
                const url =
                    `${PLACES_BASE}/textsearch/json` +
                    `?query=${encodeURIComponent(q)}` +
                    `&location=${location}` +
                    `&radius=${SEARCH_RADIUS}` +
                    `&key=${MAPS_KEY}`;
                const data = await gFetch(url);
                if (data.status === "OK" && data.results) {
                    all.push(...data.results);
                } else if (!["ZERO_RESULTS", "OK"].includes(data.status)) {
                    console.warn(`textSearch "${q}" status: ${data.status}`);
                }
            } catch (e) {
                console.warn(`textSearch "${q}" failed:`, e.message);
            }
        }

        // 2. nearbySearch supplement — only if we have < 5 results so far
        if (dedupe(all).length < 5) {
            for (const kw of ["perfume", "attar"]) {
                try {
                    const url =
                        `${PLACES_BASE}/nearbysearch/json` +
                        // ⚠️ type must be single string — arrays break the API
                        `?location=${location}` +
                        `&radius=${SEARCH_RADIUS}` +
                        `&type=store` +
                        `&keyword=${encodeURIComponent(kw)}` +
                        `&key=${MAPS_KEY}`;
                    const data = await gFetch(url);
                    if (data.status === "OK" && data.results) {
                        all.push(...data.results.filter(isPerfumeRelevant));
                    }
                } catch (e) {
                    console.warn(`nearbySearch "${kw}" failed:`, e.message);
                }
            }
        }

        // 3. Dedupe, filter closed/permanently closed, sort by rating, cap at 20
        const results = dedupe(all)
            .filter((r) => r.business_status !== "CLOSED_PERMANENTLY")
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 20)
            .map(normalise);

        res.json({ results, count: results.length });

    } catch (err) {
        console.error("Places /nearby error:", err);
        res.status(500).json({ error: "Failed to fetch nearby places." });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/places/detail?placeId=ChIJ...
// Returns full place detail: phone, hours, website, photos, reviews
// ─────────────────────────────────────────────────────────────────────────────
router.get("/detail", async (req, res) => {
    try {
        const { placeId } = req.query;
        if (!placeId) return res.status(400).json({ error: "placeId is required." });
        if (!MAPS_KEY) return res.status(500).json({ error: "GOOGLE_MAPS_API_KEY not configured." });

        const fields = [
            "name", "formatted_address", "formatted_phone_number",
            "opening_hours", "rating", "user_ratings_total",
            "website", "photos", "reviews", "price_level",
            "geometry", "url", "business_status",
        ].join(",");

        const url =
            `${PLACES_BASE}/details/json` +
            `?place_id=${encodeURIComponent(placeId)}` +
            `&fields=${fields}` +
            `&key=${MAPS_KEY}`;

        const data = await gFetch(url);

        if (data.status !== "OK") {
            return res.status(404).json({ error: `Place detail status: ${data.status}` });
        }

        const p = data.result;
        res.json({
            name: p.name,
            formatted_address: p.formatted_address,
            phone: p.formatted_phone_number ?? null,
            website: p.website ?? null,
            url: p.url ?? null, // Google Maps URL
            rating: p.rating ?? null,
            user_ratings_total: p.user_ratings_total ?? null,
            price_level: p.price_level ?? null,
            open_now: p.opening_hours?.open_now ?? null,
            weekday_text: p.opening_hours?.weekday_text ?? [],
            // Return up to 3 photo references for the frontend to render
            photos: (p.photos ?? []).slice(0, 3).map((ph) => ({
                reference: ph.photo_reference,
                width: ph.width,
                height: ph.height,
            })),
            reviews: (p.reviews ?? []).slice(0, 3).map((rv) => ({
                author: rv.author_name,
                avatar: rv.profile_photo_url,
                rating: rv.rating,
                text: rv.text,
                time: rv.relative_time_description,
            })),
            geometry: {
                lat: p.geometry?.location?.lat ?? null,
                lng: p.geometry?.location?.lng ?? null,
            },
        });

    } catch (err) {
        console.error("Places /detail error:", err);
        res.status(500).json({ error: "Failed to fetch place details." });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/places/photo?ref=PHOTO_REFERENCE&maxwidth=400
// Proxies Google photo so browser never needs the API key.
// Google Places Photo API redirects to the actual image — we follow the
// redirect and return the final image bytes to the browser.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/photo", async (req, res) => {
    try {
        const { ref, maxwidth = 400 } = req.query;
        if (!ref) return res.status(400).json({ error: "ref is required." });
        if (!MAPS_KEY) return res.status(500).send("API key not configured");

        const url =
            `${PLACES_BASE}/photo` +
            `?maxwidth=${maxwidth}` +
            `&photoreference=${ref}` +
            `&key=${MAPS_KEY}`;

        // node-fetch follows redirects by default (Google Photo API returns 302)
        const photoRes = await fetch(url);
        if (!photoRes.ok) return res.status(photoRes.status).send("Photo fetch failed");

        const contentType = photoRes.headers.get("content-type") || "image/jpeg";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.setHeader("Access-Control-Allow-Origin", "*");

        // node-fetch body is a Node stream — pipe directly to response
        photoRes.body.pipe(res);

    } catch (err) {
        console.error("Places /photo error:", err);
        res.status(500).send("Photo proxy failed");
    }
});

export default router;