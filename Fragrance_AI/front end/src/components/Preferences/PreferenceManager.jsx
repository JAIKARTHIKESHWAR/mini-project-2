import React from 'react';
import { useApp } from '../../context/AppContext';

const PreferenceManager = () => {
  const { state, dispatch } = useApp();

  const preferenceCategories = [
    {
      title: "Mood & Emotion",
      icon: "😊",
      preferences: [
        { key: 'mood', label: 'Current Mood', value: state.user.preferences.mood },
        { key: 'energy', label: 'Energy Level', value: '' }
      ]
    },
    {
      title: "Occasion & Setting",
      icon: "🎯",
      preferences: [
        { key: 'occasion', label: 'Occasion Type', value: state.user.preferences.occasion },
        { key: 'setting', label: 'Environment', value: '' }
      ]
    },
    {
      title: "Scent Profile",
      icon: "👃",
      preferences: [
        { key: 'intensity', label: 'Intensity Preference', value: state.user.preferences.intensity },
        { key: 'longevity', label: 'Longevity', value: '' }
      ]
    },
    {
      title: "Environmental",
      icon: "🌤️",
      preferences: [
        { key: 'weather', label: 'Weather Preference', value: state.user.preferences.weather },
        { key: 'season', label: 'Season', value: '' }
      ]
    },
    {
      title: "Timing",
      icon: "⏰",
      preferences: [
        { key: 'timeOfDay', label: 'Time of Day', value: state.user.preferences.timeOfDay },
        { key: 'duration', label: 'Wear Duration', value: '' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-montserrat font-semibold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-3">
          Your Scent Preferences
        </h2>
        <p className="text-accent-silver text-lg">
          Manage your fragrance preferences for better AI recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preferenceCategories.map((category, index) => (
          <div key={index} className="glass-panel hover:transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <h3 className="font-montserrat font-semibold text-lg">{category.title}</h3>
            </div>
            
            <div className="space-y-3">
              {category.preferences.map((pref, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg border border-accent-silver/20">
                  <label className="block text-sm font-medium text-accent-silver mb-1">
                    {pref.label}
                  </label>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${pref.value ? 'text-white' : 'text-accent-silver/60'}`}>
                      {pref.value || 'Not set'}
                    </span>
                    <button className="text-accent-cyan hover:text-accent-cyan/80 transition-colors text-xs">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel text-center">
        <h3 className="text-xl font-montserrat font-semibold mb-3">Ready to Update?</h3>
        <p className="text-accent-silver mb-4">
          Complete your profile for the most accurate fragrance recommendations
        </p>
        <button className="btn-primary">
          Update All Preferences
        </button>
      </div>
    </div>
  );
};

export default PreferenceManager;