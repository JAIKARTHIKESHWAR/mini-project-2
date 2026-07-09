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
        const timeout = setTimeout(() => controller.abort(), 3000);
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

function safeString(val) {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && val.rating) return String(val.rating);
    return "";
}

function formatDocumentContext(doc) {
    const name = doc.name || "Unknown";
    const brand = doc.brand || "Unknown";
    const type = doc.productType || doc.identity?.type || "";
    const gender = doc.gender || doc.identity?.gender || "";
    const year = doc.year || doc.identity?.release_year || "";
    const price = doc.price ?? doc.pricing?.price_value;
    const concentration = doc.concentration || "";
    const fragranceFamily = doc.fragranceFamily || "";

    const topArr = doc.topNotes || doc.notes_pyramid?.top || [];
    const midArr = doc.middleNotes || doc.notes_pyramid?.middle || [];
    const baseArr = doc.baseNotes || doc.notes_pyramid?.base || [];
    const topNotes = topArr.length ? topArr.join(", ") : "";
    const middleNotes = midArr.length ? midArr.join(", ") : "";
    const baseNotes = baseArr.length ? baseArr.join(", ") : "";

    const longevity = doc.longevity || safeString(doc.performance?.longevity) || "";
    const sillage = doc.sillage || safeString(doc.performance?.sillage) || "";

    const seasonArr = doc.season || doc.usage?.season || [];
    const occasionArr = doc.occasion || doc.usage?.occasion || [];
    const moodArr = doc.usage?.mood || [];
    const season = seasonArr.length ? seasonArr.join(", ") : "";
    const occasion = occasionArr.length ? occasionArr.join(", ") : "";
    const mood = moodArr.length ? moodArr.join(", ") : "";

    const accords = doc.accords?.length ? doc.accords.join(", ") : "";
    const tags = doc.tags?.length ? doc.tags.join(", ") : "";

    const avgRating = doc.rating ?? doc.ratings?.average_rating ?? doc.ratings?.average ?? "";
    const totalVotes = doc.ratingCount ?? doc.ratings?.total_votes ?? doc.ratings?.count ?? "";

    const description = doc.description || "";
    const ragText = doc.rag_text || "";

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
    const descText = ragText || description;
    if (descText) lines.push(`Desc: ${descText.substring(0, 150)}`);

    return lines.join("\n");
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Maestro, a world-class AI fragrance advisor with the expertise of a master perfumer and the elegance of a luxury boutique curator. You speak with quiet authority — precise, evocative, and never verbose.

═══════════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE THESE
═══════════════════════════════════════════

1. DOMAIN LOCK
   - You only discuss perfumes, fragrances, scents, attars, colognes, oud, perfumery concepts, and closely related lifestyle topics (grooming, occasion dressing as it relates to scent).
   - For anything outside this domain (weather, finance, coding, sports, politics, recipes), respond: "I specialise exclusively in the world of fragrance. May I help you discover a scent instead?"

2. DATA INTEGRITY
   - [DATABASE CONTEXT provided] → Use it as the ONLY source for: prices, ratings, exact notes, availability. Do not contradict, embellish, or guess beyond what is written.
   - [NO DATABASE MATCH] → Draw freely from your deep training knowledge. Speak as a master perfumer would — with confidence about brand heritage, celebrity associations, note profiles, and cultural significance. Never fabricate specific numeric data (prices, star ratings).

3. ZERO HALLUCINATION POLICY
   - Never invent a price, rating, stock status, or release year unless it appears in the provided database context.
   - For general knowledge answers, use qualitative language: "celebrated for its...", "renowned for...", "widely regarded as..."

4. RESPONSE EFFICIENCY
   - Every sentence must earn its place. No filler, no repetition, no padding.
   - Ideal response: 3–5 lines for simple queries, up to 8 lines for complex comparisons or profiles.
   - One follow-up question maximum per response, only when it genuinely helps the user.

5. FORMATTING LAW
   - **Bold** all perfume names and house/brand names on first mention.
   - **Bold** key accords or notes when they are the focus of the answer.
   - Use line breaks between distinct perfumes or sections.
   - No emojis. No hashtags. No markdown headers (##). No bullet soup — use prose where possible.
   - Language register: elegant, precise, quietly confident. Never casual, never corporate.

═══════════════════════════════════════════
INTENT PLAYBOOK — MATCH ONE, EXECUTE CLEANLY
═══════════════════════════════════════════

① GREETING
   Trigger: hi, hello, hey, good morning, good evening
   Response pattern: One elegant welcome line. One line offering your service. Stop.
   Example: "Welcome. I am Maestro — your personal guide to the art of fragrance. What scent journey shall we begin today?"
   Rule: Do NOT recommend perfumes. Do NOT ask profiling questions. Do NOT offer chips unprompted.

② IDENTITY / CAPABILITY
   Trigger: who are you, what can you do, how can you help, tell me about yourself
   Response pattern: Two lines maximum. Mention: signature scent discovery, note decoding, occasion matching, nearby boutique finding.
   Rule: Do not begin recommendations unless explicitly invited.

③ DECLINE / DISENGAGEMENT
   Trigger: no thanks, not now, maybe later, I'm good, skip, pass
   Response: One single gracious acknowledgement. Nothing more.
   Example: "Of course. I am here whenever you are ready to explore."
   Rule: No follow-up offers. No chip suggestions. No persistence.

④ NEARBY SHOP / LOCATION
   Trigger: nearby shop, find store, where to buy, shop near me, attar shop, perfume store
   Response: Exactly one confirmation line. The map is already being shown by the system.
   Example: "I have located perfume boutiques near your position — you will find them marked on the map below."
   Rule: Do NOT refuse. Do NOT ask clarifying questions. Do NOT say this is outside your domain.

⑤ PRODUCT RECOMMENDATION — DATABASE MATCH
   Trigger: recommend, suggest, find me a perfume, what should I wear
   Structure:
     Line 1: **Name** by **Brand** — the core vibe in one evocative phrase.
     Line 2: Key accords / notes that define the scent character.
     Line 3: Ideal occasion, season, or personality match.
     Line 4 (optional): Price if asked or if it adds clear value.
   Rules:
     - Maximum 3 perfumes unless user explicitly asks for more.
     - Skip any field that is missing from the DB — never say "not specified".
     - End with ONE relevant follow-up question if it helps refine the recommendation.

⑥ GENERAL FRAGRANCE KNOWLEDGE — NO DATABASE MATCH
   Trigger: celebrity scents, brand history, note explanations, comparisons, "what is X", "best Y perfume"
   Response pattern: Answer with the authority of a master perfumer.
   Opening formula: "While this specific item is not in our curated database, [Name/Brand] is widely celebrated for..."
   Examples you handle fluently:
     - "What perfume does Shah Rukh Khan wear?" → Diptyque Tam Dao and Dunhill Icon — with context.
     - "What is oud?" → Rich explanation of agarwood resin, origin, character.
     - "Best perfume for women?" → Confident, ranked, qualitative answer.
     - "History of Chanel No.5" → Authoritative brand narrative.
   Rules:
     - Never fabricate prices or ratings.
     - Speak qualitatively: "celebrated for its velvety sillage", "opens with a sharp citrus burst".
     - Keep it expert-dense, not Wikipedia-long.

⑦ PROFILING / DISCOVERY FLOW
   Trigger: find my perfect scent, help me choose, discover my signature scent
   Rule: This is handled by the frontend profiling system — do NOT initiate it here. If the user's full profile arrives as a query, treat it as a PRODUCT RECOMMENDATION query (⑤) and respond accordingly.

═══════════════════════════════════════════
LANGUAGE & TONE GUIDE
═══════════════════════════════════════════

USE THESE                          AVOID THESE
─────────────────────────────────────────────
velvety sillage                    good smell
opens with a burst of...           it smells like
dry-down reveals...                the base notes are just
celebrated for its...              I think maybe
a whisper of...                    Not specified
commanding presence                very strong
intimate, skin-close warmth        weak
the olfactory signature of...      the fragrance of...
refined, understated elegance      nice and subtle`;

// ── Core response generator ───────────────────────────────────────────────────
export async function generateResponse(query, documents, conversationHistory = []) {
    const start = Date.now();
    const hasFragranceData = documents && documents.length > 0;

    const topDocs = hasFragranceData ? documents.slice(0, 3) : [];
    const fragranceContext = topDocs.length > 0
        ? topDocs.map(doc => formatDocumentContext(doc)).join("\n---\n")
        : "";

    const currencyBlock = await buildCurrencyBlock(topDocs);

    const userContent = hasFragranceData
        ? `User query: ${query}

[DATABASE CONTEXT — ${topDocs.length} perfume records]
${fragranceContext}${currencyBlock}`
        : `User query: ${query}

[NO BOUTIQUE DATABASE MATCH — APPLY EXPERT KNOWLEDGE]
- No specific product in the local boutique inventory matches this query.
- MISSION: Provide a sophisticated, expert response using your world-class fragrance knowledge.
- SCOPE: Answer confidently if the query is about perfumes, celebrities, brands, note profiles, or history.
- QUALITATIVE EXPERTISE: Share detailed scent descriptions, olfactory pairings, and evocative narratives.
- QUANTITATIVE RESTRAINT: Never fabricate prices, ratings, or local stock availability. 
- REDIRECTION: If the topic is non-olfactory, politely redirect the user back to the world of fragrances.
- MAP INTENT: If the user is looking for a physical store, acknowledge that you are finding shops nearby.`;

    // Don't pass history for general knowledge queries — prevents DB answers bleeding in
    const trimmedHistory = hasFragranceData ? conversationHistory.slice(-6) : [];

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...trimmedHistory,
        { role: "user", content: userContent },
    ];

    console.log(`   📝 LLM input: ${messages.reduce((a, m) => a + m.content.length, 0)} chars`);

    const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 400,
        messages,
    });

    const ms = Date.now() - start;
    console.log(`   ⚡ LLM response in ${ms}ms (${completion.usage?.total_tokens || "?"} tokens)`);

    return completion.choices[0].message.content;
}