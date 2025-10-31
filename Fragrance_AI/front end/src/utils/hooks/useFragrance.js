import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

// Custom hook for fragrance-related operations
export const useFragrance = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate AI recommendations based on user preferences
  const generateRecommendations = async (preferences) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock recommendations based on preferences
      const mockRecommendations = generateMockRecommendations(preferences);
      
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: mockRecommendations });
      return mockRecommendations;
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save custom blend
  const saveCustomBlend = (blendData) => {
    const newBlend = {
      id: Date.now(),
      ...blendData,
      created: new Date().toISOString().split('T')[0],
      match: calculateBlendMatch(blendData)
    };
    
    dispatch({ type: 'ADD_BLEND', payload: newBlend });
    return newBlend;
  };

  // Add to scent history
  const addToScentHistory = (fragranceData) => {
    const historyEntry = {
      id: Date.now(),
      ...fragranceData,
      timestamp: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_SCENT_HISTORY', payload: historyEntry });
  };

  // Calculate AI match score for a blend
  const calculateBlendMatch = (blendData) => {
    // Simple algorithm to calculate match score
    let score = 70; // Base score
    
    // Add points for note complexity (optimal is 4-6 notes)
    const noteCount = blendData.notes.length;
    if (noteCount >= 4 && noteCount <= 6) score += 15;
    else if (noteCount > 6) score += 5;
    
    // Add points for seasonal appropriateness
    if (blendData.season === getCurrentSeason()) score += 10;
    
    return Math.min(score, 98); // Cap at 98%
  };

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  // Generate mock recommendations (for demo purposes)
  const generateMockRecommendations = (preferences) => {
    const baseFragrances = [
      {
        id: 1,
        name: "Ocean Breeze",
        brand: "Aqua Di Selva",
        match: 85 + Math.floor(Math.random() * 15),
        notes: ["Citrus", "Marine", "Musk", "Bergamot"],
        price: "$89",
        image: "🌊",
        longevity: "6-8 hours",
        sillage: "Moderate"
      },
      {
        id: 2,
        name: "Midnight Oud",
        brand: "Royal Arabian",
        match: 80 + Math.floor(Math.random() * 20),
        notes: ["Oud", "Rose", "Amber", "Saffron"],
        price: "$156",
        image: "🌙",
        longevity: "10+ hours",
        sillage: "Strong"
      },
      {
        id: 3,
        name: "Vanilla Sky",
        brand: "Cloud Perfumes",
        match: 75 + Math.floor(Math.random() * 25),
        notes: ["Vanilla", "Tonka", "Almond", "Caramel"],
        price: "$75",
        image: "☁️",
        longevity: "7-9 hours",
        sillage: "Moderate"
      }
    ];

    // Adjust matches based on preferences
    return baseFragrances.map(fragrance => ({
      ...fragrance,
      match: Math.min(fragrance.match + getPreferenceBonus(preferences), 98)
    }));
  };

  // Calculate bonus based on user preferences
  const getPreferenceBonus = (preferences) => {
    let bonus = 0;
    
    if (preferences.mood?.includes('Energetic')) bonus += 5;
    if (preferences.occasion?.includes('Work')) bonus += 3;
    if (preferences.intensity?.includes('Moderate')) bonus += 2;
    
    return bonus;
  };

  return {
    loading,
    error,
    generateRecommendations,
    saveCustomBlend,
    addToScentHistory,
    calculateBlendMatch
  };
};

// Hook for managing scent wheel interactions
export const useScentWheel = () => {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleNote = (note) => {
    setSelectedNotes(prev => 
      prev.includes(note) 
        ? prev.filter(n => n !== note)
        : [...prev, note].slice(0, 8) // Limit to 8 notes
    );
  };

  const clearSelection = () => {
    setSelectedNotes([]);
  };

  const getNoteIntensity = (note) => {
    // Mock intensity calculation
    return Math.floor(Math.random() * 40) + 60;
  };

  return {
    selectedNotes,
    activeCategory,
    setActiveCategory,
    toggleNote,
    clearSelection,
    getNoteIntensity
  };
};

// Hook for virtual spray simulation
export const useVirtualSpray = () => {
  const [isSpraying, setIsSpraying] = useState(false);
  const [sprayHistory, setSprayHistory] = useState([]);

  const triggerSpray = (fragrance) => {
    setIsSpraying(true);
    
    // Add to spray history
    const sprayEvent = {
      id: Date.now(),
      fragrance,
      timestamp: new Date().toISOString()
    };
    setSprayHistory(prev => [sprayEvent, ...prev.slice(0, 9)]); // Keep last 10
    
    // Auto stop after 2 seconds
    setTimeout(() => setIsSpraying(false), 2000);
  };

  const clearHistory = () => {
    setSprayHistory([]);
  };

  return {
    isSpraying,
    sprayHistory,
    triggerSpray,
    clearHistory
  };
};