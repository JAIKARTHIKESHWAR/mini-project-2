/**
 * Run this from your backend folder:
 *   node debug-places.js
 *
 * It will show you EXACTLY what Google returns for each query
 * so we can see the real error (REQUEST_DENIED, INVALID_KEY, etc.)
 */

import dotenv from "dotenv";
dotenv.config();

const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
const lat = "11.0168";
const lng = "76.9558";
const location = `${lat},${lng}`;
const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

console.log("\n=== PLACES API DEBUG ===");
console.log("API Key found:", MAPS_KEY ? `YES (${MAPS_KEY.substring(0, 8)}...)` : "NO KEY FOUND ❌");
console.log("Location:", location);
console.log("");

async function testTextSearch(query) {
    const url = `${PLACES_BASE}/textsearch/json?query=${encodeURIComponent(query)}&location=${location}&radius=10000&key=${MAPS_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`\n--- textSearch: "${query}" ---`);
        console.log("Status:", data.status);
        if (data.error_message) console.log("Error message:", data.error_message);
        if (data.results?.length) {
            console.log(`Results: ${data.results.length}`);
            console.log("First result:", data.results[0]?.name, "|", data.results[0]?.vicinity);
        } else {
            console.log("Results: 0");
        }
    } catch (e) {
        console.log(`textSearch "${query}" THREW:`, e.message);
    }
}

async function testNearbySearch(keyword) {
    const url = `${PLACES_BASE}/nearbysearch/json?location=${location}&radius=10000&type=store&keyword=${encodeURIComponent(keyword)}&key=${MAPS_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`\n--- nearbySearch keyword: "${keyword}" ---`);
        console.log("Status:", data.status);
        if (data.error_message) console.log("Error message:", data.error_message);
        if (data.results?.length) {
            console.log(`Results: ${data.results.length}`);
            console.log("First result:", data.results[0]?.name, "|", data.results[0]?.vicinity);
        } else {
            console.log("Results: 0");
        }
    } catch (e) {
        console.log(`nearbySearch "${keyword}" THREW:`, e.message);
    }
}

// Run all tests
await testTextSearch("perfume shop");
await testTextSearch("fragrance store");
await testTextSearch("attar shop");
await testNearbySearch("perfume");
await testNearbySearch("attar");

console.log("\n=== DONE ===\n");
console.log("If you see REQUEST_DENIED → your API key doesn't have Places API enabled for server use");
console.log("If you see ZERO_RESULTS   → searches ran fine but nothing found at this location");
console.log("If you see OK             → working! Check the results count above");
