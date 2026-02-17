
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function checkCollections() {
    try {
        if (!process.env.MONGO_URI) {
            console.error("No MONGO_URI");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const db = mongoose.connection.db;

        const perfumesCount = await db.collection('perfumes').countDocuments();
        const fragranceDataCount = await db.collection('fragrance_data').countDocuments();

        console.log(`'perfumes' count: ${perfumesCount}`);
        console.log(`'fragrance_data' count: ${fragranceDataCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCollections();
