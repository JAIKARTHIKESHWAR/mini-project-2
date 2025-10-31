 import React, { useState } from 'react';

const MyBlends = () => {
  const [customBlends, setCustomBlends] = useState([
    {
      id: 1,
      name: "Midnight Romance",
      notes: ["Rose", "Vanilla", "Oud", "Amber"],
      created: "2024-01-15",
      match: 92,
      season: "Evening",
      popularity: 87,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 2,
      name: "Ocean Dream",
      notes: ["Citrus", "Marine", "Musk", "Bergamot"],
      created: "2024-01-10",
      match: 88,
      season: "Summer",
      popularity: 92,
      color: "from-cyan-400 to-blue-500"
    },
    {
      id: 3,
      name: "Woody Elegance", 
      notes: ["Sandalwood", "Bergamot", "Amber", "Vetiver"],
      created: "2024-01-05",
      match: 95,
      season: "All Season",
      popularity: 78,
      color: "from-amber-600 to-yellow-700"
    },
    {
      id: 4,
      name: "Citrus Sunrise",
      notes: ["Lemon", "Ginger", "Mint", "Green Tea"],
      created: "2024-01-02",
      match: 85,
      season: "Daytime",
      popularity: 95,
      color: "from-yellow-400 to-orange-500"
    }
  ]);

  const [selectedBlend, setSelectedBlend] = useState(null);

  const handleShare = (blendId) => {
    // Simulate share action
    const blend = customBlends.find(b => b.id === blendId);
    alert(`Share link for "${blend.name}" copied to clipboard!`);
  };

  const handleEdit = (blendId) => {
    setSelectedBlend(customBlends.find(b => b.id === blendId));
  };

  const getPopularityColor = (popularity) => {
    if (popularity >= 90) return 'text-green-400';
    if (popularity >= 80) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="glass-panel">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-montserrat font-semibold">💎 My Custom Blends</h3>
          <p className="text-accent-silver">Your personalized fragrance creations</p>
        </div>
        <button className="btn-primary">
          Create New Blend
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {customBlends.map(blend => (
          <div 
            key={blend.id}
            className="bg-white/5 border border-accent-silver/20 rounded-xl p-4 hover:border-accent-cyan transition-all duration-300 group"
          >
            {/* Blend Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-montserrat font-semibold text-lg group-hover:text-accent-cyan transition-colors">
                  {blend.name}
                </h4>
                <p className="text-xs text-accent-silver">{blend.created}</p>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-cyan to-accent-gold flex items-center justify-center text-sm font-bold text-primary-dark">
                  {blend.match}%
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {blend.notes.map((note, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-accent-cyan/10 border border-accent-cyan rounded-full text-xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center text-xs text-accent-silver mb-4">
              <div className="flex items-center gap-1">
                <span>🌤️</span>
                <span>{blend.season}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span className={getPopularityColor(blend.popularity)}>
                  {blend.popularity}%
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(blend.id)}
                className="flex-1 btn-secondary text-xs py-2"
              >
                Edit
              </button>
              <button 
                onClick={() => handleShare(blend.id)}
                className="flex-1 btn-primary text-xs py-2"
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {customBlends.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h4 className="text-xl font-montserrat font-semibold mb-2">No Custom Blends Yet</h4>
          <p className="text-accent-silver mb-6 max-w-md mx-auto">
            Start creating your signature scents in the Personalization Lab. Your creations will appear here.
          </p>
          <button className="btn-primary">
            Visit Personalization Lab
          </button>
        </div>
      )}

      {/* Selected Blend Details */}
      {selectedBlend && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel max-w-md w-full mx-4">
            <h3 className="text-2xl font-montserrat font-semibold mb-4">Edit {selectedBlend.name}</h3>
            {/* Add edit form here */}
            <div className="flex gap-3">
              <button className="btn-primary flex-1">Save Changes</button>
              <button 
                onClick={() => setSelectedBlend(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBlends;