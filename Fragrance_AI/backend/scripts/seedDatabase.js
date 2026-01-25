import mongoose from 'mongoose';
import dotenv from 'dotenv';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import models
import Perfume from '../models/Perfume.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Function to clean and format data
function cleanData(data) {
  const clean = {};
  
  // Clean and format each field
  if (data.Name) clean.name = data.Name.trim();
  if (data.Brand) clean.brand = data.Brand.trim();
  if (data.Description) clean.description = data.Description.trim();
  if (data.Price) clean.price = parseFloat(data.Price) || 0;
  if (data.Rate) clean.rating = parseFloat(data.Rate) || 0;
  if (data.Rating_count) clean.ratingCount = parseInt(data.Rating_count) || 0;
  if (data.image) clean.imageUrl = data.image;
  if (data.Gender) clean.gender = data.Gender;
  if (data.Product_Type) clean.productType = data.Product_Type;
  if (data.Character) clean.character = data.Character;
  if (data.Fragrance_Family) clean.fragranceFamily = data.Fragrance_Family;
  if (data.Size) clean.size = data.Size;
  if (data.Year) clean.year = parseInt(data.Year) || null;
  if (data.Concentration) clean.concentration = data.Concentration;
  
  // Parse notes arrays
  if (data.Notes) {
    clean.notes = data.Notes.split(',').map(note => note.trim()).filter(note => note);
  }
  if (data.Top_note) {
    clean.topNotes = data.Top_note.split(',').map(note => note.trim()).filter(note => note);
  }
  if (data.Middle_note) {
    clean.middleNotes = data.Middle_note.split(',').map(note => note.trim()).filter(note => note);
  }
  if (data.Base_note) {
    clean.baseNotes = data.Base_note.split(',').map(note => note.trim()).filter(note => note);
  }
  if (data.Ingredients) {
    clean.ingredients = data.Ingredients.split(',').map(ingredient => ingredient.trim()).filter(ingredient => ingredient);
  }
  
  // Set default values
  clean.isActive = true;
  clean.longevity = '4-6 hours';
  clean.sillage = 'Moderate';
  clean.intensity = 'Moderate';
  clean.season = ['All Season'];
  clean.occasion = ['Casual'];
  
  return clean;
}

// Function to determine season based on notes
function determineSeason(notes) {
  if (!notes || notes.length === 0) return ['All Season'];
  
  const springNotes = ['floral', 'green', 'light', 'fresh'];
  const summerNotes = ['citrus', 'aquatic', 'marine', 'fresh'];
  const fallNotes = ['woody', 'spicy', 'amber', 'warm'];
  const winterNotes = ['oriental', 'sweet', 'leather', 'warm'];
  
  const noteString = notes.join(' ').toLowerCase();
  
  const seasons = [];
  if (springNotes.some(note => noteString.includes(note))) seasons.push('Spring');
  if (summerNotes.some(note => noteString.includes(note))) seasons.push('Summer');
  if (fallNotes.some(note => noteString.includes(note))) seasons.push('Fall');
  if (winterNotes.some(note => noteString.includes(note))) seasons.push('Winter');
  
  return seasons.length > 0 ? seasons : ['All Season'];
}

// Function to determine occasion based on notes
function determineOccasion(notes) {
  if (!notes || notes.length === 0) return ['Casual'];
  
  const noteString = notes.join(' ').toLowerCase();
  
  const occasions = [];
  if (noteString.includes('citrus') || noteString.includes('fresh')) occasions.push('Work');
  if (noteString.includes('floral') || noteString.includes('sweet')) occasions.push('Date');
  if (noteString.includes('woody') || noteString.includes('oriental')) occasions.push('Evening');
  if (noteString.includes('sport') || noteString.includes('aquatic')) occasions.push('Sport');
  
  return occasions.length > 0 ? occasions : ['Casual'];
}

// Function to determine intensity
function determineIntensity(notes) {
  if (!notes || notes.length === 0) return 'Moderate';
  
  const intenseNotes = ['oud', 'leather', 'patchouli', 'amber', 'incense', 'tobacco'];
  const noteString = notes.join(' ').toLowerCase();
  
  const intenseCount = intenseNotes.filter(note => noteString.includes(note)).length;
  
  if (intenseCount >= 3) return 'Strong';
  if (intenseCount >= 1) return 'Moderate';
  return 'Light';
}

// Function to determine longevity
function determineLongevity(notes) {
  if (!notes || notes.length === 0) return '4-6 hours';
  
  const baseNotes = ['sandalwood', 'amber', 'musk', 'vanilla', 'patchouli', 'oud'];
  const noteString = notes.join(' ').toLowerCase();
  
  const baseCount = baseNotes.filter(note => noteString.includes(note)).length;
  
  if (baseCount >= 3) return '8+ hours';
  if (baseCount >= 2) return '6-8 hours';
  if (baseCount >= 1) return '4-6 hours';
  return '2-4 hours';
}

// Function to seed database from CSV
async function seedFromCSV(csvPath) {
  return new Promise((resolve, reject) => {
    const perfumes = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const cleanData = cleanData(data);
          
          // Skip if essential fields are missing
          if (!cleanData.name || !cleanData.brand) {
            return;
          }
          
          // Determine additional properties
          cleanData.season = determineSeason(cleanData.notes);
          cleanData.occasion = determineOccasion(cleanData.notes);
          cleanData.intensity = determineIntensity(cleanData.notes);
          cleanData.longevity = determineLongevity(cleanData.notes);
          
          perfumes.push(cleanData);
        } catch (error) {
          console.warn('Error processing row:', error);
        }
      })
      .on('end', () => {
        resolve(perfumes);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Perfume.deleteMany({});
    console.log('🗑️ Cleared existing perfume data');
    
    // Seed from multiple CSV files
    const csvFiles = [
      '../Datasets/final_perfume_data.csv',
      '../Datasets/Perfume_Dataset.csv'
    ];
    
    let allPerfumes = [];
    
    for (const csvFile of csvFiles) {
      const csvPath = path.join(__dirname, csvFile);
      
      if (fs.existsSync(csvPath)) {
        console.log(`📄 Processing ${csvFile}...`);
        const perfumes = await seedFromCSV(csvPath);
        allPerfumes = allPerfumes.concat(perfumes);
        console.log(`✅ Processed ${perfumes.length} perfumes from ${csvFile}`);
      } else {
        console.warn(`⚠️ File not found: ${csvPath}`);
      }
    }
    
    // Remove duplicates based on name and brand
    const uniquePerfumes = [];
    const seen = new Set();
    
    for (const perfume of allPerfumes) {
      const key = `${perfume.name.toLowerCase()}-${perfume.brand.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePerfumes.push(perfume);
      }
    }
    
    console.log(`📊 Total unique perfumes: ${uniquePerfumes.length}`);
    
    // Insert into database
    if (uniquePerfumes.length > 0) {
      await Perfume.insertMany(uniquePerfumes);
      console.log(`✅ Successfully seeded ${uniquePerfumes.length} perfumes`);
    } else {
      console.log('⚠️ No perfumes to seed');
    }
    
    // Create some sample data if no CSV data
    if (uniquePerfumes.length === 0) {
      console.log('📝 Creating sample data...');
      
      const samplePerfumes = [
        {
          name: "Bleu de Chanel",
          brand: "Chanel",
          description: "A timeless aromatic fragrance that embodies elegance and sophistication.",
          notes: ["Grapefruit", "Ginger", "Incense", "Sandalwood", "Cedar", "White Musk"],
          topNotes: ["Grapefruit", "Ginger"],
          middleNotes: ["Incense"],
          baseNotes: ["Sandalwood", "Cedar", "White Musk"],
          price: 135,
          imageUrl: "https://example.com/bleu-de-chanel.jpg",
          gender: "Men",
          productType: "Eau de Parfum",
          character: "Sophisticated",
          fragranceFamily: "Aromatic",
          size: "100ml",
          year: 2010,
          concentration: "Eau de Parfum",
          longevity: "6-8 hours",
          sillage: "Moderate",
          intensity: "Moderate",
          season: ["Spring", "Fall"],
          occasion: ["Work", "Evening"],
          rating: 4.8,
          ratingCount: 1250,
          isActive: true
        },
        {
          name: "Acqua di Gio",
          brand: "Giorgio Armani",
          description: "A fresh aquatic fragrance capturing the essence of the Mediterranean sea.",
          notes: ["Bergamot", "Neroli", "Jasmine", "Rock Rose", "Patchouli", "Marine Notes"],
          topNotes: ["Bergamot", "Neroli"],
          middleNotes: ["Jasmine", "Rock Rose"],
          baseNotes: ["Patchouli", "Marine Notes"],
          price: 98,
          imageUrl: "https://example.com/acqua-di-gio.jpg",
          gender: "Men",
          productType: "Eau de Toilette",
          character: "Fresh",
          fragranceFamily: "Aquatic",
          size: "100ml",
          year: 1996,
          concentration: "Eau de Toilette",
          longevity: "4-6 hours",
          sillage: "Light",
          intensity: "Light",
          season: ["Spring", "Summer"],
          occasion: ["Casual", "Work"],
          rating: 4.6,
          ratingCount: 2100,
          isActive: true
        }
      ];
      
      await Perfume.insertMany(samplePerfumes);
      console.log(`✅ Created ${samplePerfumes.length} sample perfumes`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run seeding
seedDatabase();
