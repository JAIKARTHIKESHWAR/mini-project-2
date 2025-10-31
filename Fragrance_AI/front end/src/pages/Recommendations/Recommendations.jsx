import React, { useState } from 'react';
import RecommendationEngine from '../../components/Recommendations/RecommendationEngine';
import PerfumeCard from '../../components/Recommendations/PerfumeCard';

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('engine');

  const recommendedFragrances = [
    {
      id: 1,
      name: "Ocean Breeze",
      brand: "Aqua Di Selva",
      match: 95,
      notes: ["Citrus", "Marine", "Musk"],
      price: "$89",
      image: "🌊",
      rating: 4.8,
      reviews: 1247
    },
    {
      id: 2,
      name: "Midnight Oud",
      brand: "Royal Arabian",
      match: 88,
      notes: ["Oud", "Rose", "Amber"],
      price: "$156",
      image: "🌙",
      rating: 4.6,
      reviews: 892
    },
    {
      id: 3,
      name: "Vanilla Sky",
      brand: "Cloud Perfumes",
      match: 92,
      notes: ["Vanilla", "Tonka", "Almond"],
      price: "$75",
      image: "☁️",
      rating: 4.7,
      reviews: 2103
    },
    {
      id: 4,
      name: "Citrus Splash",
      brand: "Fresh & Co",
      match: 96,
      notes: ["Lemon", "Bergamot", "Ginger"],
      price: "$68",
      image: "🍋",
      rating: 4.9,
      reviews: 1567
    },
    {
      id: 5,
      name: "Woody Elegance",
      brand: "Forest Essence",
      match: 91,
      notes: ["Sandalwood", "Cedar", "Vetiver"],
      price: "$124",
      image: "🌲",
      rating: 4.5,
      reviews: 743
    },
    {
      id: 6,
      name: "Floral Dream",
      brand: "Bloom & Co",
      match: 89,
      notes: ["Rose", "Jasmine", "Lily"],
      price: "$98",
      image: "🌹",
      rating: 4.8,
      reviews: 1834
    }
  ];

  const tabs = [
    { id: 'engine', label: 'Recommendation Engine', icon: '🎯' },
    { id: 'results', label: 'Your Matches', icon: '💎' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'engine': return <RecommendationEngine />;
      case 'results': return (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-montserrat font-semibold mb-2">Your Personalized Matches</h2>
            <p className="text-accent-silver">Based on your preferences and scent profile</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedFragrances.map(fragrance => (
              <PerfumeCard key={fragrance.id} fragrance={fragrance} />
            ))}
          </div>
        </div>
      );
      default: return <RecommendationEngine />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
          🎯 AI Recommendations
        </h1>
        <p className="text-xl text-accent-silver max-w-3xl mx-auto">
          Discover your perfect fragrance matches using our advanced AI recommendation engine. Get personalized suggestions based on your preferences and scent profile.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel mb-8">
        <div className="flex border-b border-accent-silver/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-accent-cyan text-accent-cyan'
                  : 'border-transparent text-accent-silver hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {renderContent()}
        </div>
      </div>

      {/* Recommendation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-cyan">156</div>
          <div className="text-sm text-accent-silver">Matches Found</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-gold">4.8</div>
          <div className="text-sm text-accent-silver">Avg Match Rating</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🎨</div>
          <div className="text-2xl font-montserrat font-semibold text-green-400">12</div>
          <div className="text-sm text-accent-silver">Scent Categories</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">💎</div>
          <div className="text-2xl font-montserrat font-semibold text-purple-400">8</div>
          <div className="text-sm text-accent-silver">Premium Picks</div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;


