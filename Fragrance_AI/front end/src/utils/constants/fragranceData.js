// Fragrance notes and categories data
export const SCENT_CATEGORIES = [
  {
    id: 'floral',
    name: 'Floral',
    icon: '🌹',
    color: 'from-pink-400 to-purple-500',
    notes: ['Rose', 'Jasmine', 'Lily', 'Lavender', 'Peony', 'Orchid', 'Tuberose', 'Ylang-Ylang']
  },
  {
    id: 'woody',
    name: 'Woody',
    icon: '🌲',
    color: 'from-amber-600 to-yellow-700',
    notes: ['Sandalwood', 'Cedar', 'Patchouli', 'Vetiver', 'Oakmoss', 'Amber', 'Guaiac Wood', 'Oud']
  },
  {
    id: 'citrus',
    name: 'Citrus',
    icon: '🍋',
    color: 'from-yellow-400 to-orange-500',
    notes: ['Lemon', 'Bergamot', 'Orange', 'Grapefruit', 'Lime', 'Mandarin', 'Yuzu', 'Bitter Orange']
  },
  {
    id: 'fresh',
    name: 'Fresh',
    icon: '🌊',
    color: 'from-cyan-400 to-blue-500',
    notes: ['Marine', 'Aquatic', 'Ozonic', 'Green Tea', 'Mint', 'Rain', 'Sea Salt', 'Water Notes']
  },
  {
    id: 'spicy',
    name: 'Spicy',
    icon: '🌶️',
    color: 'from-red-500 to-orange-600',
    notes: ['Cinnamon', 'Black Pepper', 'Cardamom', 'Clove', 'Nutmeg', 'Ginger', 'Saffron', 'Incense']
  },
  {
    id: 'sweet',
    name: 'Sweet',
    icon: '🍯',
    color: 'from-yellow-300 to-amber-400',
    notes: ['Vanilla', 'Caramel', 'Chocolate', 'Honey', 'Praline', 'Tonka Bean', 'Marshmallow', 'Cotton Candy']
  },
  {
    id: 'oriental',
    name: 'Oriental',
    icon: '🕌',
    color: 'from-purple-500 to-red-500',
    notes: ['Myrrh', 'Frankincense', 'Labdanum', 'Benzoin', 'Opoponax', 'Ambergris', 'Musk', 'Leather']
  }
];

// Mood to scent mapping
export const MOOD_SCENT_MAPPING = {
  energetic: {
    recommended: ['citrus', 'fresh', 'spicy'],
    notes: ['Lemon', 'Ginger', 'Mint', 'Black Pepper'],
    description: 'Uplifting and invigorating scents'
  },
  calm: {
    recommended: ['floral', 'woody', 'sweet'],
    notes: ['Lavender', 'Sandalwood', 'Vanilla', 'Chamomile'],
    description: 'Soothing and relaxing scents'
  },
  romantic: {
    recommended: ['floral', 'sweet', 'oriental'],
    notes: ['Rose', 'Jasmine', 'Vanilla', 'Amber'],
    description: 'Sensual and intimate scents'
  },
  professional: {
    recommended: ['woody', 'citrus', 'fresh'],
    notes: ['Bergamot', 'Vetiver', 'Cedar', 'Marine'],
    description: 'Sophisticated and clean scents'
  },
  adventurous: {
    recommended: ['spicy', 'woody', 'oriental'],
    notes: ['Leather', 'Patchouli', 'Black Pepper', 'Oud'],
    description: 'Bold and daring scents'
  }
};

// Occasion recommendations
export const OCCASION_RECOMMENDATIONS = {
  work: {
    intensity: 'light',
    longevity: 'moderate',
    notes: ['Bergamot', 'Neroli', 'White Musk', 'Green Tea'],
    description: 'Office-appropriate, subtle scents'
  },
  date: {
    intensity: 'moderate',
    longevity: 'long',
    notes: ['Rose', 'Vanilla', 'Sandalwood', 'Amber'],
    description: 'Sensual and memorable scents'
  },
  gym: {
    intensity: 'fresh',
    longevity: 'short',
    notes: ['Citrus', 'Mint', 'Aquatic', 'Ginger'],
    description: 'Clean and energizing scents'
  },
  evening: {
    intensity: 'strong',
    longevity: 'very-long',
    notes: ['Oud', 'Leather', 'Patchouli', 'Incense'],
    description: 'Bold and sophisticated scents'
  },
  everyday: {
    intensity: 'versatile',
    longevity: 'moderate',
    notes: ['Lavender', 'Bergamot', 'White Musk', 'Amberwood'],
    description: 'Versatile and comfortable scents'
  }
};

// Popular fragrance brands
export const POPULAR_BRANDS = [
  'Chanel', 'Dior', 'Creed', 'Tom Ford', 'Giorgio Armani',
  'Yves Saint Laurent', 'Gucci', 'Hermès', 'Prada', 'Versace',
  'Dolce & Gabbana', 'Bvlgari', 'Montblanc', 'Jean Paul Gaultier',
  'Paco Rabanne', 'Carolina Herrera', 'Viktor & Rolf', 'Maison Margiela'
];

// Price ranges for filtering
export const PRICE_RANGES = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200+', min: 200, max: 1000 }
];

// Season recommendations
export const SEASONAL_SCENTS = {
  spring: {
    notes: ['Floral', 'Green', 'Citrus', 'Light Fruits'],
    description: 'Fresh and blooming scents'
  },
  summer: {
    notes: ['Citrus', 'Aquatic', 'Light Florals', 'Tropical Fruits'],
    description: 'Light and refreshing scents'
  },
  fall: {
    notes: ['Woody', 'Spicy', 'Amber', 'Warm Gourmands'],
    description: 'Warm and cozy scents'
  },
  winter: {
    notes: ['Oriental', 'Sweet', 'Leather', 'Heavy Woods'],
    description: 'Rich and intense scents'
  }
};

export default {
  SCENT_CATEGORIES,
  MOOD_SCENT_MAPPING,
  OCCASION_RECOMMENDATIONS,
  POPULAR_BRANDS,
  PRICE_RANGES,
  SEASONAL_SCENTS
};