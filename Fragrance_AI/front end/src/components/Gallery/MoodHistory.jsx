import React from 'react';

const MoodHistory = () => {
  const moodData = [
    { date: '2024-01-15', mood: 'Energetic', scent: 'Citrus', match: 92 },
    { date: '2024-01-14', mood: 'Calm', scent: 'Floral', match: 88 },
    { date: '2024-01-13', mood: 'Romantic', scent: 'Sweet', match: 95 },
    { date: '2024-01-12', mood: 'Professional', scent: 'Woody', match: 85 },
    { date: '2024-01-11', mood: 'Adventurous', scent: 'Spicy', match: 90 },
    { date: '2024-01-10', mood: 'Creative', scent: 'Fresh', match: 87 }
  ];

  const getMoodIcon = (mood) => {
    const icons = {
      'Energetic': '💪',
      'Calm': '😌',
      'Romantic': '💖',
      'Professional': '👔',
      'Adventurous': '🌍',
      'Creative': '🎨'
    };
    return icons[mood] || '😊';
  };

  const getScentColor = (scent) => {
    const colors = {
      'Floral': 'from-pink-400 to-purple-500',
      'Woody': 'from-amber-600 to-yellow-700',
      'Citrus': 'from-yellow-400 to-orange-500',
      'Fresh': 'from-cyan-400 to-blue-500',
      'Spicy': 'from-red-500 to-orange-600',
      'Sweet': 'from-yellow-300 to-amber-400'
    };
    return colors[scent] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="glass-panel h-full">
      <h3 className="text-xl font-montserrat font-semibold mb-2">🌤️ Mood History Insight</h3>
      <p className="text-accent-silver mb-6">Track how your moods influence scent preferences</p>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {moodData.map((entry, index) => (
          <div 
            key={index}
            className="p-4 bg-white/5 border border-accent-silver/20 rounded-xl hover:border-accent-cyan transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  {getMoodIcon(entry.mood)}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{entry.mood}</h4>
                  <p className="text-xs text-accent-silver">{entry.date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getScentColor(entry.scent)}`}></div>
                  <span className="text-sm font-medium">{entry.scent}</span>
                </div>
                <div className="text-xs text-accent-silver mt-1">Match: {entry.match}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-gold rounded-full"
                  style={{ width: `${entry.match}%` }}
                ></div>
              </div>
              <span className="text-xs text-accent-silver">{entry.match}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-accent-cyan/5 border border-accent-cyan rounded-xl">
        <h4 className="font-semibold text-accent-cyan text-sm mb-1">Pattern Detected</h4>
        <p className="text-xs text-accent-silver">
          You prefer fresh scents when energetic and sweet scents during romantic moods.
        </p>
      </div>
    </div>
  );
};

export default MoodHistory;