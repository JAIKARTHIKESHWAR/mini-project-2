import React, { useState } from 'react';
import CollectionGrid from '../../components/Collections/CollectionGrid';
import ThemeCard from '../../components/Collections/ThemeCard';

const Collections = () => {
  const [activeTab, setActiveTab] = useState('collections');

  const moodThemes = [
    {
      id: 1,
      name: "Midnight Serenade",
      mood: "Romantic",
      description: "Sensual scents for intimate evenings",
      icon: "🌙",
      match: 92,
      notes: ["Rose", "Vanilla", "Oud", "Amber"]
    },
    {
      id: 2,
      name: "Urban Professional",
      mood: "Professional",
      description: "Sophisticated scents for the workplace",
      icon: "🏙️",
      match: 88,
      notes: ["Bergamot", "Vetiver", "Leather", "Patchouli"]
    },
    {
      id: 3,
      name: "Ocean Explorer",
      mood: "Adventurous",
      description: "Fresh and bold scents for adventures",
      icon: "🌊",
      match: 85,
      notes: ["Marine", "Citrus", "Musk", "Ambergris"]
    },
    {
      id: 4,
      name: "Zen Garden",
      mood: "Calm",
      description: "Soothing scents for relaxation",
      icon: "🎋",
      match: 90,
      notes: ["Sandalwood", "Lavender", "Tea", "Musk"]
    },
    {
      id: 5,
      name: "Sunrise Energy",
      mood: "Energetic",
      description: "Invigorating scents for active days",
      icon: "🌅",
      match: 87,
      notes: ["Citrus", "Ginger", "Mint", "Green Notes"]
    },
    {
      id: 6,
      name: "Artistic Soul",
      mood: "Creative",
      description: "Inspiring scents for creative moments",
      icon: "🎨",
      match: 83,
      notes: ["Incense", "Myrrh", "Leather", "Smoke"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
          🌈 Fragrance Collections
        </h1>
        <p className="text-xl text-accent-silver max-w-3xl mx-auto">
          Explore curated fragrance collections and mood-based themes designed to match every aspect of your lifestyle and personality.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel mb-8">
        <div className="flex border-b border-accent-silver/20">
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
              activeTab === 'collections'
                ? 'border-accent-cyan text-accent-cyan'
                : 'border-transparent text-accent-silver hover:text-white'
            }`}
          >
            🗂️ Collections
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
              activeTab === 'themes'
                ? 'border-accent-cyan text-accent-cyan'
                : 'border-transparent text-accent-silver hover:text-white'
            }`}
          >
            🎭 Mood Themes
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 ${
              activeTab === 'seasonal'
                ? 'border-accent-cyan text-accent-cyan'
                : 'border-transparent text-accent-silver hover:text-white'
            }`}
          >
            🍂 Seasonal
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'collections' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-montserrat font-semibold">Curated Collections</h2>
                  <p className="text-accent-silver">Expertly selected fragrance groupings</p>
                </div>
                <div className="flex gap-3">
                  <button className="btn-secondary text-sm">Filter</button>
                  <button className="btn-primary text-sm">New Collection</button>
                </div>
              </div>
              <CollectionGrid />
            </div>
          )}

          {activeTab === 'themes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-montserrat font-semibold">Mood-Based Themes</h2>
                  <p className="text-accent-silver">Fragrances curated for specific emotions and occasions</p>
                </div>
                <button className="btn-primary text-sm">Take Mood Quiz</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {moodThemes.map(theme => (
                  <ThemeCard key={theme.id} theme={theme} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seasonal' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍂</div>
              <h3 className="text-2xl font-montserrat font-semibold mb-3">Seasonal Collections Coming Soon</h3>
              <p className="text-accent-silver max-w-md mx-auto">
                Our seasonal fragrance collections are being curated for the upcoming season. Check back soon for fresh arrivals!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🏷️</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-cyan">150+</div>
          <div className="text-sm text-accent-silver">Fragrances</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🗂️</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-gold">12</div>
          <div className="text-sm text-accent-silver">Collections</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-montserrat font-semibold text-green-400">4.8</div>
          <div className="text-sm text-accent-silver">Avg Rating</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-montserrat font-semibold text-purple-400">2.4k</div>
          <div className="text-sm text-accent-silver">Community</div>
        </div>
      </div>
    </div>
  );
};

export default Collections;