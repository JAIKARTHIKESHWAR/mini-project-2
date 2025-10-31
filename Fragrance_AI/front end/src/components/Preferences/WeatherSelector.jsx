import React from 'react';

const WeatherSelector = () => {
  const weatherOptions = [
    { id: 'sunny', icon: '☀️', label: 'Sunny & Warm', description: 'Bright, fresh scents' },
    { id: 'cloudy', icon: '☁️', label: 'Cloudy & Mild', description: 'Balanced, versatile scents' },
    { id: 'rainy', icon: '🌧️', label: 'Rainy & Cool', description: 'Warm, comforting scents' },
    { id: 'cold', icon: '❄️', label: 'Cold & Crisp', description: 'Rich, intense scents' },
    { id: 'windy', icon: '💨', label: 'Windy & Fresh', description: 'Light, airy scents' },
    { id: 'humid', icon: '💧', label: 'Humid & Tropical', description: 'Clean, aquatic scents' }
  ];

  return (
    <div className="glass-panel">
      <h3 className="text-xl font-montserrat font-semibold mb-2">🌤️ Weather Preferences</h3>
      <p className="text-accent-silver mb-6">Select your preferred weather conditions for scent recommendations</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {weatherOptions.map(weather => (
          <div
            key={weather.id}
            className="p-4 bg-white/5 border border-accent-silver/20 rounded-xl cursor-pointer transition-all duration-300 hover:bg-accent-cyan/10 hover:border-accent-cyan hover:transform hover:scale-105 group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              {weather.icon}
            </div>
            <h4 className="font-semibold text-sm mb-1">{weather.label}</h4>
            <p className="text-xs text-accent-silver">{weather.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherSelector;