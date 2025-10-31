import React, { useState } from 'react';
import MoodSelector from '../../components/Preferences/MoodSelector';
import WeatherSelector from '../../components/Preferences/WeatherSelector';
import PreferenceManager from '../../components/Preferences/PreferenceManager';

const Preferences = () => {
  const [activeTab, setActiveTab] = useState('mood');

  const tabs = [
    { id: 'mood', label: 'Mood Preferences', icon: '😊' },
    { id: 'weather', label: 'Weather Settings', icon: '🌤️' },
    { id: 'profile', label: 'Profile Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'mood': return <MoodSelector />;
      case 'weather': return <WeatherSelector />;
      case 'profile': return <PreferenceManager />;
      default: return <MoodSelector />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
          ⚙️ Your Preferences
        </h1>
        <p className="text-xl text-accent-silver max-w-3xl mx-auto">
          Customize your fragrance experience by setting your mood preferences, weather conditions, and personal profile.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel mb-8">
        <div className="flex border-b border-accent-silver/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all duration-300 border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-accent-cyan text-accent-cyan'
                  : 'border-transparent text-accent-silver hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {renderContent()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">😊</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-cyan">5</div>
          <div className="text-sm text-accent-silver">Mood Profiles</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🌤️</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-gold">Auto</div>
          <div className="text-sm text-accent-silver">Weather Sync</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-montserrat font-semibold text-green-400">92%</div>
          <div className="text-sm text-accent-silver">Accuracy</div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;


