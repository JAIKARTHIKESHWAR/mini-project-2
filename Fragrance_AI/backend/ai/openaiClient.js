import OpenAI from "openai";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure env vars are loaded
dotenv.config({ path: join(__dirname, '../.env') });

if (!process.env.OPENAI_API_KEY) {
    console.error("❌ CRITICAL: OPENAI_API_KEY is missing in backend/.env!");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 25000,     // 25s max per request — prevents hanging
    maxRetries: 1,      // Only 1 retry — fail fast
});
