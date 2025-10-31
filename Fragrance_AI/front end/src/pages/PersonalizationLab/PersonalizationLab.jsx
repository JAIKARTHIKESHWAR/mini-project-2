import React, { useState } from 'react';
import ScentWheel from '../../components/PersonalizationLab/ScentWheel';
import NoteSlider from '../../components/PersonalizationLab/NoteSlider';
import AIFeedback from '../../components/PersonalizationLab/AIFeedback';

const PersonalizationLab = () => {
  const [activeTab, setActiveTab] = useState('wheel');

  const tabs = [
    { id: 'wheel', label: 'Scent Wheel', icon: '🎯' },
    { id: 'notes', label: 'Note Slider', icon: '🎚️' },
    { id: 'feedback', label: 'AI Feedback', icon: '🤖' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'wheel': return <ScentWheel />;
      case 'notes': return <NoteSlider />;
      case 'feedback': return <AIFeedback />;
      default: return <ScentWheel />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
          🧪 Personalization Lab
        </h1>
        <p className="text-xl text-accent-silver max-w-3xl mx-auto">
          Create your perfect fragrance using our advanced AI tools. Experiment with scent combinations and get personalized recommendations.
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

      {/* Lab Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🧪</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-cyan">24</div>
          <div className="text-sm text-accent-silver">Experiments</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-montserrat font-semibold text-accent-gold">4.7</div>
          <div className="text-sm text-accent-silver">Avg Rating</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-montserrat font-semibold text-green-400">92%</div>
          <div className="text-sm text-accent-silver">Accuracy</div>
        </div>
        <div className="glass-panel text-center">
          <div className="text-3xl mb-2">💾</div>
          <div className="text-2xl font-montserrat font-semibold text-purple-400">8</div>
          <div className="text-sm text-accent-silver">Saved Blends</div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationLab;


