import React, { useState } from 'react';

const ScentWheel = () => {
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  
  const scentCategories = [
    { 
      name: 'Floral', 
      notes: ['Rose', 'Jasmine', 'Lavender', 'Lily', 'Peony', 'Orchid'], 
      color: 'from-pink-400 to-purple-500',
      icon: '🌹'
    },
    { 
      name: 'Woody', 
      notes: ['Sandalwood', 'Cedar', 'Patchouli', 'Vetiver', 'Oakmoss', 'Amber'], 
      color: 'from-amber-700 to-yellow-800',
      icon: '🌲'
    },
    { 
      name: 'Citrus', 
      notes: ['Lemon', 'Orange', 'Bergamot', 'Grapefruit', 'Lime', 'Mandarin'], 
      color: 'from-yellow-400 to-orange-500',
      icon: '🍋'
    },
    { 
      name: 'Fresh', 
      notes: ['Ocean', 'Rain', 'Mint', 'Green Tea', 'Aquatic', 'Ozonic'], 
      color: 'from-cyan-400 to-blue-500',
      icon: '🌊'
    },
    { 
      name: 'Spicy', 
      notes: ['Cinnamon', 'Pepper', 'Clove', 'Cardamom', 'Nutmeg', 'Ginger'], 
      color: 'from-red-500 to-orange-600',
      icon: '🌶️'
    },
    { 
      name: 'Sweet', 
      notes: ['Vanilla', 'Caramel', 'Chocolate', 'Honey', 'Praline', 'Tonka'], 
      color: 'from-yellow-300 to-amber-400',
      icon: '🍯'
    }
  ];

  const toggleNote = (note) => {
    setSelectedNotes(prev => 
      prev.includes(note) 
        ? prev.filter(n => n !== note)
        : [...prev, note].slice(0, 8) // Limit to 8 notes
    );
  };

  const getNoteIntensity = (note) => {
    return Math.floor(Math.random() * 40) + 60; // Random intensity between 60-100
  };

  return (
    <div className="glass-panel">
      <h3 className="text-2xl font-montserrat font-semibold mb-2">🎨 Scent Composition Wheel</h3>
      <p className="text-accent-silver mb-6">Create your custom fragrance by selecting and balancing scent notes</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scent Wheel Visualization */}
        <div className="relative h-80 flex items-center justify-center">
          <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary-dark to-primary-black border-2 border-accent-silver/20">
            {scentCategories.map((category, index) => {
              const angle = (360 / scentCategories.length) * index;
              const isActive = activeCategory === category.name;
              
              return (
                <div 
                  key={category.name}
                  className={`absolute top-1/2 left-1/2 w-32 h-32 origin-top-left transition-all duration-300 ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{ transform: `rotate(${angle}deg) translateX(80px) rotate(${angle}deg)` }}
                  onMouseEnter={() => setActiveCategory(category.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div 
                    className={`w-full h-full bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center cursor-pointer transform -rotate-${angle} border-2 ${
                      isActive ? 'border-white shadow-lg' : 'border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                </div>
              );
            })}
            
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-accent-cyan to-accent-gold rounded-full flex items-center justify-center shadow-xl">
              <span className="text-primary-dark font-bold text-sm text-center">
                {selectedNotes.length}/8
              </span>
            </div>
          </div>
        </div>

        {/* Notes Selection */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-accent-cyan mb-3">Selected Notes ({selectedNotes.length}/8):</h4>
            <div className="flex flex-wrap gap-2 min-h-12">
              {selectedNotes.map(note => (
                <span 
                  key={note} 
                  className="px-3 py-2 bg-accent-cyan/20 border border-accent-cyan rounded-full text-sm font-medium flex items-center gap-2 group hover:bg-accent-cyan/30 transition-colors"
                >
                  {note}
                  <button 
                    onClick={() => toggleNote(note)}
                    className="text-xs hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {selectedNotes.length === 0 && (
                <p className="text-accent-silver/60 italic">No notes selected yet</p>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {scentCategories.map(category => (
                <div key={category.name} className="space-y-2">
                  <h5 className={`font-semibold text-sm flex items-center gap-2 ${activeCategory === category.name ? 'text-accent-cyan' : 'text-white'}`}>
                    <span>{category.icon}</span>
                    {category.name}
                  </h5>
                  <div className="space-y-1">
                    {category.notes.map(note => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-all duration-200 ${
                          selectedNotes.includes(note)
                            ? 'bg-accent-cyan/20 border border-accent-cyan text-white'
                            : 'bg-white/5 border border-accent-silver/20 text-accent-silver hover:bg-accent-cyan/10 hover:border-accent-cyan/50'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedNotes.length > 0 && (
            <button className="w-full btn-primary mt-4">
              Create Custom Blend with {selectedNotes.length} Notes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScentWheel;