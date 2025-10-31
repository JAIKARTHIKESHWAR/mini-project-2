import React, { useState } from 'react';

const VirtualSpray = () => {
  const [isSpraying, setIsSpraying] = useState(false);
  const [selectedFragrance, setSelectedFragrance] = useState('Ocean Breeze');

  const fragrances = [
    { name: 'Ocean Breeze', icon: '🌊', color: 'from-cyan-400 to-blue-500' },
    { name: 'Midnight Oud', icon: '🌙', color: 'from-purple-500 to-indigo-600' },
    { name: 'Vanilla Sky', icon: '☁️', color: 'from-yellow-300 to-amber-400' },
    { name: 'Citrus Splash', icon: '🍋', color: 'from-green-400 to-yellow-500' }
  ];

  const handleSpray = () => {
    setIsSpraying(true);
    setTimeout(() => setIsSpraying(false), 2000);
  };

  const currentFragrance = fragrances.find(f => f.name === selectedFragrance);

  return (
    <div className="glass-panel h-full">
      <h3 className="text-xl font-montserrat font-semibold mb-2">💨 Virtual Spray Visualizer</h3>
      <p className="text-accent-silver mb-6">Experience how your fragrance diffuses in the air</p>
      
      <div className="space-y-6">
        {/* Fragrance Selector */}
        <div>
          <label className="block text-sm font-medium text-accent-silver mb-2">
            Select Fragrance:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fragrances.map(fragrance => (
              <button
                key={fragrance.name}
                onClick={() => setSelectedFragrance(fragrance.name)}
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  selectedFragrance === fragrance.name
                    ? `border-accent-cyan bg-accent-cyan/10 shadow-lg shadow-accent-cyan/20`
                    : 'border-accent-silver/20 bg-white/5 hover:border-accent-cyan/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{fragrance.icon}</span>
                  <span className="text-xs">{fragrance.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Spray Visualization */}
        <div className="relative h-48 bg-gradient-to-b from-primary-dark to-primary-black rounded-xl border border-accent-silver/20 overflow-hidden">
          {/* Perfume Bottle */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl z-10">
            {currentFragrance?.icon}
          </div>
          
          {/* Spray Effect */}
          {isSpraying && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full filter blur-sm animate-mist-float bg-gradient-to-r ${currentFragrance?.color}`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    left: `${Math.random() * 80 + 10}%`,
                    bottom: '20%',
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* Scent Waves */}
          {isSpraying && (
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 rounded-full border-2 animate-pulse opacity-0`}
                  style={{
                    animation: `pulse 2s ease-out ${i * 0.5}s`,
                    borderColor: currentFragrance?.color.includes('cyan') ? '#00FFFF' : '#EACD76'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Spray Button */}
        <button 
          onClick={handleSpray}
          disabled={isSpraying}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            isSpraying 
              ? 'bg-red-500 text-white' 
              : 'btn-primary hover:scale-105'
          }`}
        >
          {isSpraying ? 'Spraying...' : `Test Spray ${selectedFragrance}`}
        </button>

        {/* Fragrance Info */}
        <div className="p-3 bg-white/5 rounded-lg border border-accent-silver/20">
          <h4 className="font-semibold text-white text-sm mb-1">{selectedFragrance}</h4>
          <p className="text-xs text-accent-silver">
            Diffusion: Medium | Longevity: 6-8 hours | Sillage: Moderate
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualSpray;