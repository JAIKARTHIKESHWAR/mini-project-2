// Real API service for fragrance data
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock database of fragrances
const MOCK_FRAGRANCES = [
  {
    id: 1,
    name: "Bleu de Chanel",
    brand: "Chanel",
    description: "A timeless aromatic fragrance that embodies elegance and sophistication.",
    notes: ["Grapefruit", "Ginger", "Incense", "Sandalwood", "Cedar", "White Musk"],
    price: 135,
    image: "🔵",
    longevity: "6-8 hours",
    sillage: "Moderate",
    rating: 4.8,
    season: ["Spring", "Fall"],
    occasion: ["Work", "Evening"],
    intensity: "Moderate"
  },
  {
    id: 2,
    name: "Acqua di Gio",
    brand: "Giorgio Armani",
    description: "A fresh aquatic fragrance capturing the essence of the Mediterranean sea.",
    notes: ["Bergamot", "Neroli", "Jasmine", "Rock Rose", "Patchouli", "Marine Notes"],
    price: 98,
    image: "🌊",
    longevity: "4-6 hours",
    sillage: "Light",
    rating: 4.6,
    season: ["Spring", "Summer"],
    occasion: ["Casual", "Work"],
    intensity: "Light"
  },
  {
    id: 3,
    name: "Sauvage",
    brand: "Dior",
    description: "A radically fresh and woody fragrance embodying raw freedom.",
    notes: ["Calabrian Bergamot", "Ambroxan", "Sichuan Pepper", "Lavender", "Vanilla"],
    price: 112,
    image: "🏜️",
    longevity: "8+ hours",
    sillage: "Strong",
    rating: 4.7,
    season: ["All Season"],
    occasion: ["Evening", "Date"],
    intensity: "Strong"
  }
];

// API Service functions
export const fragranceAPI = {
  // Authentication
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async logout() {
    localStorage.removeItem('authToken');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Fragrance operations
  async getPerfumes(params = {}) {
    const response = await api.get('/fragrance', { params });
    return response.data;
  },

  async getPerfumeById(id) {
    const response = await api.get(`/fragrance/${id}`);
    return response.data;
  },

  async searchFragrances(query, limit = 10) {
    const response = await api.get(`/fragrance/search/${encodeURIComponent(query)}`, {
      params: { limit }
    });
    return response.data;
  },

  async getRecommendations(preferences) {
    const response = await api.post('/fragrance/recommendations', preferences);
    return response.data;
  },

  async analyzePerfume(notes) {
    const response = await api.post('/fragrance/analyze', { notes });
    return response.data;
  },

  async getTrending(limit = 10) {
    const response = await api.get('/fragrance/trending/trending', {
      params: { limit }
    });
    return response.data;
  },

  async getBrands() {
    const response = await api.get('/fragrance/brands/list');
    return response.data;
  },

  async getFragranceFamilies() {
    const response = await api.get('/fragrance/families/list');
    return response.data;
  },

  // Custom blend operations
  async createCustomBlend(blendData) {
    const response = await api.post('/custom-blend', blendData);
    return response.data;
  },

  async getMyBlends(params = {}) {
    const response = await api.get('/custom-blend/my-blends', { params });
    return response.data;
  },

  async getPublicBlends(params = {}) {
    const response = await api.get('/custom-blend/public', { params });
    return response.data;
  },

  async getCustomBlendById(id) {
    const response = await api.get(`/custom-blend/${id}`);
    return response.data;
  },

  async updateCustomBlend(id, blendData) {
    const response = await api.put(`/custom-blend/${id}`, blendData);
    return response.data;
  },

  async deleteCustomBlend(id) {
    const response = await api.delete(`/custom-blend/${id}`);
    return response.data;
  },

  async duplicateCustomBlend(id, name) {
    const response = await api.post(`/custom-blend/${id}/duplicate`, { name });
    return response.data;
  },

  async analyzeCustomBlend(id) {
    const response = await api.post(`/custom-blend/${id}/analyze`);
    return response.data;
  },

  async rateCustomBlend(id, rating) {
    const response = await api.post(`/custom-blend/${id}/rate`, { rating });
    return response.data;
  },

  // Review operations
  async createReview(reviewData) {
    const response = await api.post('/review', reviewData);
    return response.data;
  },

  async getPerfumeReviews(perfumeId, params = {}) {
    const response = await api.get(`/review/perfume/${perfumeId}`, { params });
    return response.data;
  },

  async getMyReviews(params = {}) {
    const response = await api.get('/review/my-reviews', { params });
    return response.data;
  },

  async getReviewById(id) {
    const response = await api.get(`/review/${id}`);
    return response.data;
  },

  async updateReview(id, reviewData) {
    const response = await api.put(`/review/${id}`, reviewData);
    return response.data;
  },

  async deleteReview(id) {
    const response = await api.delete(`/review/${id}`);
    return response.data;
  },

  async markReviewHelpful(id) {
    const response = await api.post(`/review/${id}/helpful`);
    return response.data;
  },

  async markReviewNotHelpful(id) {
    const response = await api.post(`/review/${id}/not-helpful`);
    return response.data;
  },

  async getPerfumeRating(perfumeId) {
    const response = await api.get(`/review/perfume/${perfumeId}/rating`);
    return response.data;
  }
};

// Helper functions
function calculateMatchScore(fragrance, preferences) {
  let score = 50; // Base score
  
  // Score based on occasion match
  if (preferences.occasion && fragrance.occasion.includes(preferences.occasion)) {
    score += 20;
  }
  
  // Score based on season match
  if (preferences.season && fragrance.season.includes(preferences.season)) {
    score += 15;
  }
  
  // Score based on intensity preference
  if (preferences.intensity && fragrance.intensity === preferences.intensity) {
    score += 15;
  }
  
  return Math.min(score, 100);
}

function generateAIInsight(fragrance, preferences) {
  const insights = [
    "This fragrance perfectly matches your preferred occasion and season.",
    "Great choice! The notes align well with your scent preferences.",
    "Based on your profile, this fragrance should work well for you.",
    "The intensity and longevity match what you're looking for."
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
}

function calculateBalance(notes) {
  const categories = {
    floral: ['Rose', 'Jasmine', 'Lily', 'Lavender'],
    woody: ['Sandalwood', 'Cedar', 'Patchouli', 'Vetiver'],
    citrus: ['Lemon', 'Bergamot', 'Orange', 'Grapefruit'],
    fresh: ['Marine', 'Mint', 'Green Tea', 'Rain'],
    spicy: ['Cinnamon', 'Pepper', 'Cardamom', 'Ginger'],
    sweet: ['Vanilla', 'Caramel', 'Honey', 'Chocolate']
  };
  
  let balance = {};
  Object.keys(categories).forEach(category => {
    balance[category] = notes.filter(note => 
      categories[category].includes(note)
    ).length;
  });
  
  return balance;
}

function getSeasonality(notes) {
  const seasonalNotes = {
    spring: ['Floral', 'Green', 'Light Fruits'],
    summer: ['Citrus', 'Aquatic', 'Tropical'],
    fall: ['Woody', 'Spicy', 'Amber'],
    winter: ['Oriental', 'Sweet', 'Leather']
  };
  
  let scores = {};
  Object.keys(seasonalNotes).forEach(season => {
    scores[season] = notes.filter(note => 
      seasonalNotes[season].some(seasonNote => note.includes(seasonNote))
    ).length;
  });
  
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

function getRecommendedOccasion(notes) {
  const occasionNotes = {
    work: ['Bergamot', 'Neroli', 'White Musk'],
    date: ['Rose', 'Vanilla', 'Sandalwood'],
    evening: ['Oud', 'Leather', 'Patchouli'],
    casual: ['Citrus', 'Aquatic', 'Light Florals']
  };
  
  let scores = {};
  Object.keys(occasionNotes).forEach(occasion => {
    scores[occasion] = notes.filter(note => 
      occasionNotes[occasion].includes(note)
    ).length;
  });
  
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

function calculateIntensity(notes) {
  const intenseNotes = ['Oud', 'Leather', 'Patchouli', 'Amber', 'Incense'];
  const intenseCount = notes.filter(note => intenseNotes.includes(note)).length;
  
  if (intenseCount >= 3) return 'Strong';
  if (intenseCount >= 1) return 'Moderate';
  return 'Light';
}

function estimateLongevity(notes) {
  const baseNotes = ['Sandalwood', 'Amber', 'Musk', 'Vanilla', 'Patchouli'];
  const baseCount = notes.filter(note => baseNotes.includes(note)).length;
  
  if (baseCount >= 3) return '8+ hours';
  if (baseCount >= 2) return '6-8 hours';
  if (baseCount >= 1) return '4-6 hours';
  return '2-4 hours';
}

function generateCompositionSuggestions(notes) {
  const suggestions = [
    "Consider adding a base note like vanilla or amber for better longevity.",
    "The blend could benefit from a citrus top note for freshness.",
    "A touch of floral notes would add complexity to this composition.",
    "This is a well-balanced blend! Ready for testing."
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

export default fragranceAPI;