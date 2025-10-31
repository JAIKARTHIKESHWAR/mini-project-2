import React, { useState } from 'react';

const MoodSelector = () => {
  const [selectedMood, setSelectedMood] = useState('');

  const moodOptions = [
    { id: 'energetic', icon: '💪', label: 'Energetic', color: 'from-yellow-400 to-orange-500', scents: ['Citrus', 'Ginger', 'Mint'] },
    { id: 'calm', icon: '😌', label: 'Calm', color: 'from-blue-400 to-purple-500', scents: ['Lavender', 'Chamomile', 'Sandalwood'] },
    { id: 'romantic', icon: '💖', label: 'Romantic', color: 'from-pink-400 to-red-500', scents: ['Rose', 'Vanilla', 'Jasmine'] },
    { id: 'professional', icon: '👔', label: 'Professional', color: 'from-gray-400 to-blue-600', scents: ['Bergamot', 'Vetiver', 'Amber'] },
    { id: 'adventurous', icon: '🌍', label: 'Adventurous', color: 'from-green-400 to-teal-500', scents: ['Oakmoss', 'Leather', 'Patchouli'] },
    { id: 'creative', icon: '🎨', label: 'Creative', color: 'from-purple-400 to-pink-500', scents: ['Incense', 'Myrrh', 'Frankincense'] }
  ];

  return (
    <div className="glass-panel">
      <h3 className="text-xl font-montserrat font-semibold mb-2">😊 Current Mood</h3>
      <p className="text-accent-silver mb-6">Select your current mood for personalized scent matching</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {moodOptions.map(mood => (
          <div
            key={mood.id}
            onClick={() => setSelectedMood(mood.id)}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform ${
              selectedMood === mood.id
                ? `border-accent-cyan bg-accent-cyan/10 scale-105 shadow-lg shadow-accent-cyan/20`
                : 'border-accent-silver/20 bg-white/5 hover:border-accent-cyan/50 hover:scale-105'
            }`}
          >
            <div className={`text-3xl mb-2 transition-transform ${
              selectedMood === mood.id ? 'scale-110' : ''
            }`}>
              {mood.icon}
            </div>
            <h4 className="font-semibold text-sm mb-2">{mood.label}</h4>
            <div className="flex flex-wrap gap-1">
              {mood.scents.map((scent, idx) => (
                <span key={idx} className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
                  {scent}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedMood && (
        <div className="p-4 bg-accent-cyan/5 border border-accent-cyan rounded-xl">
          <h4 className="font-semibold text-accent-cyan mb-2">Recommended Scents for {moodOptions.find(m => m.id === selectedMood)?.label}</h4>
          <p className="text-sm text-accent-silver">
            Based on your mood, we recommend fresh, uplifting scents with citrus and herbal notes to match your energetic vibe.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;