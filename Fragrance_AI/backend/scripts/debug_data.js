
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = mongoose.connection.db.collection('fragrance_data');
        
        const cases = [
            { $or: [{ name: /Chanel/i }, { brand: /Chanel/i }] },
            { $or: [{ name: /Sauvage/i }, { brand: /Sauvage/i }] },
            { $or: [{ name: /Tobacco Vanille/i }, { brand: /Tobacco Vanille/i }] }
        ];

        for (const query of cases) {
            console.log(`\n--- Looking for: ${JSON.stringify(query)} ---`);
            const docs = await col.find(query).limit(3).toArray();
            console.log(docs.map(d => ({ name: d.name, brand: d.brand, tags: d.tags })));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
