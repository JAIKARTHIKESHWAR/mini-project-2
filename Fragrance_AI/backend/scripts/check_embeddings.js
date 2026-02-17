
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function checkEmbeddings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('fragrance_data');

        // Count docs with embedding field
        const count = await collection.countDocuments({ embedding: { $exists: true } });
        const total = await collection.countDocuments();

        console.log(`Total docs: ${total}`);
        console.log(`Docs with embeddings: ${count}`);

        if (count === 0) {
            console.log("No embeddings found! Run generateEmbeddings.js");
        } else if (count < total) {
            console.log(`Missing embeddings for ${total - count} docs.`);
        } else {
            console.log("All docs have embeddings!");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEmbeddings();
