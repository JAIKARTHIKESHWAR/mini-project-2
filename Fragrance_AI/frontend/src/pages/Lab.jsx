import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const Lab = () => {
  const [selectedNotes, setSelectedNotes] = useState({
    base: [],
    heart: [],
    top: []
  });
  const [intensities, setIntensities] = useState({});
  const [activeCategory, setActiveCategory] = useState('base');
  const canvasRef = useRef();

  const fragranceNotes = {
    base: [
      { id: 1, name: 'Cedar Wood', category: 'Woody', color: '#8B4513' },
      { id: 2, name: 'Vetiver', category: 'Woody', color: '#654321' },
      { id: 3, name: 'Sandalwood', category: 'Woody', color: '#DEB887' },
      { id: 4, name: 'Patchouli', category: 'Earthy', color: '#7B3F00' },
      { id: 5, name: 'Musk', category: 'Animalic', color: '#F5F5DC' },
      { id: 6, name: 'Amber', category: 'Warm', color: '#FFBF00' }
    ],
    heart: [
      { id: 7, name: 'Rose', category: 'Floral', color: '#FF69B4' },
      { id: 8, name: 'Jasmine', category: 'Floral', color: '#FFF8DC' },
      { id: 9, name: 'Lavender', category: 'Herbal', color: '#E6E6FA' },
      { id: 10, name: 'Geranium', category: 'Floral', color: '#FFB6C1' },
      { id: 11, name: 'Cinnamon', category: 'Spicy', color: '#D2691E' },
      { id: 12, name: 'Nutmeg', category: 'Spicy', color: '#A0522D' }
    ],
    top: [
      { id: 13, name: 'Bergamot', category: 'Citrus', color: '#F0E68C' },
      { id: 14, name: 'Lemon', category: 'Citrus', color: '#FFF700' },
      { id: 15, name: 'Orange', category: 'Citrus', color: '#FFA500' },
      { id: 16, name: 'Grapefruit', category: 'Citrus', color: '#FDBCB4' },
      { id: 17, name: 'Pepper', category: 'Spicy', color: '#8B0000' },
      { id: 18, name: 'Green Notes', category: 'Fresh', color: '#90EE90' }
    ]
  };

  const handleNoteSelect = (note) => {
    const currentNotes = selectedNotes[activeCategory];
    if (currentNotes.find(n => n.id === note.id)) {
      // Remove note
      setSelectedNotes(prev => ({
        ...prev,
        [activeCategory]: currentNotes.filter(n => n.id !== note.id)
      }));
      setIntensities(prev => {
        const newIntensities = { ...prev };
        delete newIntensities[note.id];
        return newIntensities;
      });
    } else if (currentNotes.length < 2) {
      // Add note (max 2 per category)
      setSelectedNotes(prev => ({
        ...prev,
        [activeCategory]: [...currentNotes, note]
      }));
      setIntensities(prev => ({
        ...prev,
        [note.id]: 50
      }));
    }
  };

  const handleIntensityChange = (noteId, value) => {
    setIntensities(prev => ({
      ...prev,
      [noteId]: value
    }));
  };

  const calculateComposition = () => {
    const totalBase = selectedNotes.base.reduce((sum, note) => sum + (intensities[note.id] || 0), 0);
    const totalHeart = selectedNotes.heart.reduce((sum, note) => sum + (intensities[note.id] || 0), 0);
    const totalTop = selectedNotes.top.reduce((sum, note) => sum + (intensities[note.id] || 0), 0);
    const total = totalBase + totalHeart + totalTop || 1;

    return {
      base: Math.round((totalBase / total) * 100),
      heart: Math.round((totalHeart / total) * 100),
      top: Math.round((totalTop / total) * 100)
    };
  };

  const composition = calculateComposition();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gold-400 to-rose-300 bg-clip-text text-transparent mb-4">
            Perfume Customization Lab
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Mix and match fragrance notes to create your perfect signature scent. 
            Our AI will help you discover similar retail perfumes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Note Selection */}
          <div className="xl:col-span-2 space-y-8">
            {/* Category Tabs */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex space-x-4 mb-6">
                {['base', 'heart', 'top'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 capitalize ${
                      activeCategory === category
                        ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category} Notes
                  </button>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder={`Search ${activeCategory} notes...`}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fragranceNotes[activeCategory].map((note) => {
                  const isSelected = selectedNotes[activeCategory].find(n => n.id === note.id);
                  return (
                    <motion.button
                      key={note.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNoteSelect(note)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-gold-400 bg-gold-400/10 shadow-lg'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: note.color }}
                      >
                        <span className="material-icons">spa</span>
                      </div>
                      <h3 className="text-white text-sm font-semibold text-center">{note.name}</h3>
                      <p className="text-gray-400 text-xs text-center">{note.category}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Intensity Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Adjust Intensities</h3>
              <div className="space-y-6">
                {Object.entries(selectedNotes).map(([category, notes]) =>
                  notes.map((note) => (
                    <div key={note.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{note.name}</span>
                        <span className="text-gold-400 font-bold">{intensities[note.id]}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={intensities[note.id] || 50}
                        onChange={(e) => handleIntensityChange(note.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Subtle</span>
                        <span>Bold</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Visualization and Composition */}
          <div className="space-y-8">
            {/* 3D Bottle Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Your Custom Blend</h3>
              
              {/* Bottle Placeholder */}
              <div className="w-full h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <span className="material-icons text-6xl text-white/50">science</span>
                  <p className="text-white/50 mt-2">3D Bottle Visualization</p>
                </div>
              </div>

              {/* Composition Breakdown */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Composition</h4>
                
                {/* Pyramid Visualization */}
                <div className="space-y-2">
                  {[
                    { label: 'Base', value: composition.base, color: 'bg-amber-500' },
                    { label: 'Heart', value: composition.heart, color: 'bg-rose-500' },
                    { label: 'Top', value: composition.top, color: 'bg-cyan-500' }
                  ].map((layer, index) => (
                    <div key={layer.label} className="flex items-center space-x-3">
                      <span className="text-gray-300 text-sm w-12">{layer.label}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${layer.color} transition-all duration-500`}
                          style={{ width: `${layer.value}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold text-sm w-8">{layer.value}%</span>
                    </div>
                  ))}
                </div>

                {/* Estimated Properties */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-3 bg-gray-700/50 rounded-xl">
                    <p className="text-gray-400 text-sm">Strength</p>
                    <p className="text-white font-semibold">Medium-Strong</p>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-xl">
                    <p className="text-gray-400 text-sm">Longevity</p>
                    <p className="text-white font-semibold">6-8 hours</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl"
            >
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-gold-500 to-amber-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Get Recommendations
                </button>
                <button className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300">
                  Save Blend
                </button>
                <button className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300">
                  Share Composition
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab;