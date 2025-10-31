import React, { useState } from 'react';

const NoteSlider = () => {
  const [noteIntensities, setNoteIntensities] = useState({
    'Floral': 50,
    'Woody': 30,
    'Citrus': 70,
    'Fresh': 40,
    'Spicy': 20,
    'Sweet': 60
  });

  const handleIntensityChange = (note, value) => {
    setNoteIntensities(prev => ({
      ...prev,
      [note]: parseInt(value)
    }));
  };

  const getIntensityColor = (intensity) => {
    if (intensity < 33) return 'from-green-400 to-cyan-400';
    if (intensity < 66) return 'from-yellow-400 to-orange-400';
    return 'from-orange-500 to-red-500';
  };

  const getIntensityLabel = (intensity) => {
    if (intensity < 20) return 'Subtle';
    if (intensity < 40) return 'Light';
    if (intensity < 60) return 'Moderate';
    if (intensity < 80) return 'Strong';
    return 'Intense';
  };

  return (
    <div className="glass-panel">
      <h3 className="text-2xl font-montserrat font-semibold mb-2">🎛️ Note Intensity Control</h3>
      <p className="text-accent-silver mb-6">Fine-tune the intensity of each scent category in your custom blend</p>
      
      <div className="space-y-6">
        {Object.entries(noteIntensities).map(([note, intensity]) => (
          <div key={note} className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-white flex items-center gap-2">
                <span className="text-lg">
                  {note === 'Floral' ? '🌹' : 
                   note === 'Woody' ? '🌲' : 
                   note === 'Citrus' ? '🍋' : 
                   note === 'Fresh' ? '🌊' : 
                   note === 'Spicy' ? '🌶️' : '🍯'}
                </span>
                {note}
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-accent-silver">{getIntensityLabel(intensity)}</span>
                <span className="text-accent-cyan font-semibold w-12 text-right">{intensity}%</span>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => handleIntensityChange(note, e.target.value)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
              <div 
                className={`absolute top-0 left-0 h-2 bg-gradient-to-r ${getIntensityColor(intensity)} rounded-lg`}
                style={{ width: `${intensity}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-accent-cyan/5 border border-accent-cyan rounded-xl">
        <h4 className="font-semibold text-accent-cyan mb-2">Blend Summary</h4>
        <p className="text-sm text-accent-silver">
          Current blend: {Object.entries(noteIntensities)
            .filter(([_, intensity]) => intensity > 30)
            .map(([note, intensity]) => `${note} (${getIntensityLabel(intensity)})`)
            .join(', ') || 'Balanced mix'}
        </p>
      </div>
    </div>
  );
};

export default NoteSlider;