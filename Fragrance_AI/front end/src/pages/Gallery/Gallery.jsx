import React, { useState } from 'react';
import MyBlends from '../../components/Gallery/MyBlends';
import ScentMemoryTracker from '../../components/Gallery/ScentMemoryTracker';
import MoodHistory from '../../components/Gallery/MoodHistory';
import SmartSuggestions from '../../components/Gallery/SmartSuggestions';
import VirtualSpray from '../../components/Gallery/VirtualSpray';
import VoiceCompanion from '../../components/Gallery/VoiceCompanion';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('blends');

  const tabs = [
    { id: 'blends', label: 'My Blends', icon: '🧪' },
    { id: 'memory', label: 'Scent Memory', icon: '🧠' },
    { id: 'mood', label: 'Mood History', icon: '😊' },
    { id: 'suggestions', label: 'Smart Suggestions', icon: '💡' },
    { id: 'spray', label: 'Virtual Spray', icon: '💨' },
    { id: 'voice', label: 'Voice Companion', icon: '🎤' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'blends': return <MyBlends />;
      case 'memory': return <ScentMemoryTracker />;
      case 'mood': return <MoodHistory />;
      case 'suggestions': return <SmartSuggestions />;
      case 'spray': return <VirtualSpray />;
      case 'voice': return <VoiceCompanion />;
      default: return <MyBlends />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
          🎨 Your Scent Gallery
        </h1>
        <p className="text-xl text-accent-silver max-w-3xl mx-auto">
          Explore your personal fragrance journey, create custom blends, and discover new scents through AI-powered insights.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel mb-8">
        <div className="flex flex-wrap border-b border-accent-silver/20">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🧪</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-cyan">12</div>
          <div className="text-sm text-accent-silver">Custom Blends</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-gold">47</div>
          <div className="text-sm text-accent-silver">Scent Memories</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-montserrat font-semibold text-green-400">89%</div>
          <div className="text-sm text-accent-silver">Match Accuracy</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-montserrat font-semibold text-purple-400">4.9</div>
          <div className="text-sm text-accent-silver">Avg Rating</div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
