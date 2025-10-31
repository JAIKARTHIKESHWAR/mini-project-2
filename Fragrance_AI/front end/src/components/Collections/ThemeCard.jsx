import React from 'react';

const ThemeCard = ({ theme }) => {
  const getMoodColor = (mood) => {
    const colors = {
      'Romantic': 'from-pink-400 to-rose-500',
      'Professional': 'from-blue-400 to-indigo-500',
      'Adventurous': 'from-green-400 to-teal-500',
      'Calm': 'from-purple-400 to-violet-500',
      'Energetic': 'from-orange-400 to-red-500',
      'Creative': 'from-yellow-400 to-amber-500'
    };
    return colors[mood] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="glass-panel hover:transform hover:scale-105 transition-all duration-300 group">
      <div className="relative mb-4">
        <div className={`w-full h-32 rounded-xl bg-gradient-to-r ${getMoodColor(theme.mood)} flex items-center justify-center text-4xl`}>
          {theme.icon}
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            {theme.fragrances.length} scents
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-montserrat font-semibold text-lg mb-1 group-hover:text-accent-cyan transition-colors">
            {theme.name}
          </h3>
          <p className="text-sm text-accent-silver">{theme.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-accent-silver">Mood: {theme.mood}</span>
          <span className="text-accent-cyan font-medium">{theme.match}% match</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {theme.notes.slice(0, 3).map((note, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-accent-cyan/10 border border-accent-cyan rounded-full text-xs"
            >
              {note}
            </span>
          ))}
          {theme.notes.length > 3 && (
            <span className="px-2 py-1 bg-white/5 border border-accent-silver/20 rounded-full text-xs text-accent-silver">
              +{theme.notes.length - 3}
            </span>
          )}
        </div>

        <button className="w-full btn-primary text-sm py-2">
          Discover Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeCard;