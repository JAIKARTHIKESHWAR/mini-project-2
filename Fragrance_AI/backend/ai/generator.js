import { openai } from "./openaiClient.js";

// ── Exchange rate cache ─────────────────────────────────────────────────────
const FALLBACK_RATES = {
    USD: 0.012, EUR: 0.011, GBP: 0.0094, AUD: 0.018, CAD: 0.016,
    AED: 0.044, SGD: 0.016, JPY: 1.78, CHF: 0.011, SAR: 0.045,
};

let cachedRates = null;
let ratesCachedAt = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getExchangeRates() {
    const now = Date.now();
    if (cachedRates && ratesCachedAt && now - ratesCachedAt < CACHE_TTL_MS) {
        return cachedRates;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
        const res = await fetch("https://open.er-api.com/v6/latest/INR", { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Rate fetch failed");
        const data = await res.json();
        cachedRates = data.rates;
        ratesCachedAt = now;
        return cachedRates;
    } catch {
        return FALLBACK_RATES;
    }
}

const SUPPORTED_CURRENCIES = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "EUR", name: "Euro" },
    { code: "GBP", symbol: "GBP", name: "British Pound" },
    { code: "AUD", symbol: "AUD", name: "Australian Dollar" },
    { code: "CAD", symbol: "CAD", name: "Canadian Dollar" },
    { code: "AED", symbol: "AED", name: "UAE Dirham" },
    { code: "SGD", symbol: "SGD", name: "Singapore Dollar" },
    { code: "JPY", symbol: "JPY", name: "Japanese Yen" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
];

async function buildCurrencyBlock(documents) {
    if (!documents || documents.length === 0) return "";

    // Only include conversions for the FIRST document with pricing (to save tokens)
    const doc = documents.find(d => d.price ?? d.pricing?.price_value);
    if (!doc) return "";

    const priceINR = doc.price ?? doc.pricing?.price_value;
    if (!priceINR || isNaN(priceINR)) return "";

    const rates = await getExchangeRates();
    const TOP_CURRENCIES = [
        { code: "USD", symbol: "$" },
        { code: "EUR", symbol: "€" },
        { code: "GBP", symbol: "£" },
    ];

    const lines = TOP_CURRENCIES.map(({ code, symbol }) => {
        const rate = rates[code] ?? FALLBACK_RATES[code] ?? null;
        if (!rate) return null;
        return `${symbol}${(priceINR * rate).toFixed(2)}`;
    }).filter(Boolean);

    return lines.length ? `\n[Currency: Rs.${priceINR.toLocaleString()} ≈ ${lines.join(" / ")}]` : "";
}

/**
 * Safely extract a string value from a field that could be a string or an object.
 * Handles both schemas: Fragrantica (string) vs FragranceX (object with .rating).
 */
function safeString(val) {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && val.rating) return String(val.rating);
    return "";
}

/**
 * Format a document into readable context for the LLM.
 * Handles BOTH schemas: Fragrantica (nested) and FragranceX (nested with different field types).
 */
function formatDocumentContext(doc) {
    const name = doc.name || "Unknown";
    const brand = doc.brand || "Unknown";
    const type = doc.productType || doc.identity?.type || "";
    const gender = doc.gender || doc.identity?.gender || "";
    const year = doc.year || doc.identity?.release_year || "";
    const price = doc.price ?? doc.pricing?.price_value;
    const concentration = doc.concentration || "";
    const fragranceFamily = doc.fragranceFamily || "";

    // Notes — handle both flat and nested
    const topArr = doc.topNotes || doc.notes_pyramid?.top || [];
    const midArr = doc.middleNotes || doc.notes_pyramid?.middle || [];
    const baseArr = doc.baseNotes || doc.notes_pyramid?.base || [];
    const topNotes = topArr.length ? topArr.join(", ") : "";
    const middleNotes = midArr.length ? midArr.join(", ") : "";
    const baseNotes = baseArr.length ? baseArr.join(", ") : "";

    // Performance — can be string OR object {rating, votes, total_votes}
    const longevity = doc.longevity || safeString(doc.performance?.longevity) || "";
    const sillage = doc.sillage || safeString(doc.performance?.sillage) || "";

    // Usage
    const seasonArr = doc.season || doc.usage?.season || [];
    const occasionArr = doc.occasion || doc.usage?.occasion || [];
    const moodArr = doc.usage?.mood || [];
    const season = seasonArr.length ? seasonArr.join(", ") : "";
    const occasion = occasionArr.length ? occasionArr.join(", ") : "";
    const mood = moodArr.length ? moodArr.join(", ") : "";

    const accords = doc.accords?.length ? doc.accords.join(", ") : "";
    const tags = doc.tags?.length ? doc.tags.join(", ") : "";

    // Ratings — handle both {average_rating, total_votes} and {average, count}
    const avgRating = doc.rating ?? doc.ratings?.average_rating ?? doc.ratings?.average ?? "";
    const totalVotes = doc.ratingCount ?? doc.ratings?.total_votes ?? doc.ratings?.count ?? "";

    const description = doc.description || "";
    const ragText = doc.rag_text || "";

    // Compact format — only include non-empty fields
    let lines = [`PERFUME: ${name} by ${brand}`];
    const meta = [type, gender, year, concentration, fragranceFamily].filter(Boolean).join(" | ");
    if (meta) lines.push(meta);
    if (price) lines.push(`Price: Rs.${price.toLocaleString()} INR`);
    if (topNotes) lines.push(`Top: ${topNotes}`);
    if (middleNotes) lines.push(`Mid: ${middleNotes}`);
    if (baseNotes) lines.push(`Base: ${baseNotes}`);
    if (accords) lines.push(`Accords: ${accords}`);
    if (longevity || sillage) lines.push(`Performance: ${[longevity && `Longevity: ${longevity}`, sillage && `Sillage: ${sillage}`].filter(Boolean).join(" | ")}`);
    if (season) lines.push(`Season: ${season}`);
    if (occasion) lines.push(`Occasion: ${occasion}`);
    if (mood) lines.push(`Mood: ${mood}`);
    if (avgRating) lines.push(`Rating: ${avgRating}/5${totalVotes ? ` (${totalVotes} votes)` : ""}`);
    if (tags) lines.push(`Tags: ${tags}`);
    // Prefer rag_text for description since it's more comprehensive
    const descText = ragText || description;
    if (descText) lines.push(`Desc: ${descText.substring(0, 150)}`);

    return lines.join("\n");
}

// ── System prompt — short, clean, user-friendly ─────────────────────────────
const SYSTEM_PROMPT = `You are Maestro, a professional AI fragrance advisor. Warm, elegant tone. No emojis.

RESPONSE RULES:
1. Keep answers SHORT and CONCISE — 3-6 lines max for most queries.
2. When user asks about a scent or perfume: show ONLY the name, brand, and key accords/notes. Nothing else upfront.
3. After listing, offer: "Would you like to know the price, performance, or seasonal details?"
4. Do NOT dump all data (price, performance, season, occasion, rating) in the first response unless explicitly asked.
5. Use clean formatting with line breaks between perfumes. Bold the perfume names.
6. For recommendations: list 2-3 perfumes max with name, brand, and a one-line description of character.
7. Don't repeat "Not specified" for missing fields — just skip them.
8. Don't invent data. Use only what's in the context.
9. For greetings: respond warmly in 2-3 lines.
10. Always end with a short follow-up question.

EXAMPLE RESPONSE FOR "tell me about Dior Sauvage":
**Dior Sauvage** by Dior
A bold, fresh-spicy fragrance with bergamot, lavender, pepper, and an ambroxan base. Woody and confident.

Would you like to know the price, performance details, or best occasions to wear it?`;

// ── Core response generator ─────────────────────────────────────────────────
export async function generateResponse(query, documents, conversationHistory = []) {
    const start = Date.now();
    const hasFragranceData = documents && documents.length > 0;

    // Limit to top 3 docs to keep context small → faster LLM response
    const topDocs = hasFragranceData ? documents.slice(0, 3) : [];
    const fragranceContext = topDocs.length > 0
        ? topDocs.map(doc => formatDocumentContext(doc)).join("\n---\n")
        : "";

    // Build currency block (compact)
    const currencyBlock = await buildCurrencyBlock(topDocs);

    const userContent = hasFragranceData
        ? `Query: ${query}\n\n[DATABASE - ${topDocs.length} perfumes]\n${fragranceContext}${currencyBlock}`
        : `Query: ${query}\n\n[No matching perfumes in database. Answer from general fragrance knowledge. Be transparent about this.]`;

    // Keep conversation history concise — last 6 messages max
    const trimmedHistory = conversationHistory.slice(-6);

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...trimmedHistory,
        { role: "user", content: userContent },
    ];

    console.log(`   📝 LLM input: ${messages.reduce((a, m) => a + m.content.length, 0)} chars`);

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.35,
        max_tokens: 400,              // Short and sweet responses
        messages,
    });

    const ms = Date.now() - start;
    console.log(`   ⚡ LLM response in ${ms}ms (${completion.usage?.total_tokens || '?'} tokens)`);

    return completion.choices[0].message.content;
}
