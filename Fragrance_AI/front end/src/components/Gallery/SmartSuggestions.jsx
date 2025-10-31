import React, { useState } from 'react';

const SmartSuggestions = () => {
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      title: "Try Citrus Notes",
      description: "Based on your recent mood patterns, citrus scents might boost your energy levels",
      confidence: 92,
      category: "Mood Enhancement",
      icon: "🍋",
      color: "from-yellow-400 to-orange-500"
    },
    {
      id: 2,
      title: "Explore Woody Scents",
      description: "Your preference for professional settings suggests you'd enjoy sophisticated woody fragrances",
      confidence: 87,
      category: "Lifestyle Match",
      icon: "🌲",
      color: "from-amber-600 to-yellow-700"
    },
    {
      id: 3,
      title: "Seasonal Recommendation",
      description: "With spring approaching, fresh floral scents would complement the season perfectly",
      confidence: 89,
      category: "Seasonal",
      icon: "🌸",
      color: "from-pink-400 to-purple-500"
    },
    {
      id: 4,
      title: "Try Layering",
      description: "Combine your favorite vanilla with a touch of bergamot for a unique signature scent",
      confidence: 85,
      category: "Blending",
      icon: "🎨",
      color: "from-purple-400 to-violet-500"
    }
  ]);

  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const handleApplySuggestion = (suggestionId) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    alert(`Applied suggestion: ${suggestion.title}`);
  };

  const handleDismissSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="glass-panel">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-montserrat font-semibold">💡 Smart Suggestions</h3>
          <p className="text-accent-silver">AI-powered recommendations based on your preferences and patterns</p>
        </div>
        <button className="btn-primary">
          Generate New Suggestions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map(suggestion => (
          <div 
            key={suggestion.id}
            className="bg-white/5 border border-accent-silver/20 rounded-xl p-6 hover:border-accent-cyan transition-all duration-300 group"
          >
            {/* Suggestion Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${suggestion.color} flex items-center justify-center text-2xl`}>
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-montserrat font-semibold text-lg group-hover:text-accent-cyan transition-colors">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-accent-silver">{suggestion.category}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getConfidenceColor(suggestion.confidence)}`}>
                  {suggestion.confidence}%
                </div>
                <div className="text-xs text-accent-silver">Confidence</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-accent-silver text-sm mb-4 leading-relaxed">
              {suggestion.description}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => handleApplySuggestion(suggestion.id)}
                className="flex-1 btn-primary text-sm py-2"
              >
                Apply Suggestion
              </button>
              <button 
                onClick={() => setSelectedSuggestion(suggestion)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Learn More
              </button>
              <button 
                onClick={() => handleDismissSuggestion(suggestion.id)}
                className="text-accent-silver hover:text-red-400 transition-colors p-2"
                title="Dismiss suggestion"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {suggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h4 className="text-xl font-montserrat font-semibold mb-2">No Suggestions Available</h4>
          <p className="text-accent-silver mb-6 max-w-md mx-auto">
            We need more data about your preferences to generate personalized suggestions. Try exploring different fragrances!
          </p>
          <button className="btn-primary">
            Explore Fragrances
          </button>
        </div>
      )}

      {/* Suggestion Details Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel max-w-md w-full mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedSuggestion.color} flex items-center justify-center text-2xl`}>
                {selectedSuggestion.icon}
              </div>
              <div>
                <h3 className="text-xl font-montserrat font-semibold">{selectedSuggestion.title}</h3>
                <p className="text-sm text-accent-silver">{selectedSuggestion.category}</p>
              </div>
            </div>
            
            <p className="text-accent-silver mb-6">{selectedSuggestion.description}</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleApplySuggestion(selectedSuggestion.id)}
                className="flex-1 btn-primary"
              >
                Apply Suggestion
              </button>
              <button 
                onClick={() => setSelectedSuggestion(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
