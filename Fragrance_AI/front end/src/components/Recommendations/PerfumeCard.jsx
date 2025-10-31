import React, { useState } from 'react';

const PerfumeCard = ({ perfume }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMatchColor = (match) => {
    if (match >= 90) return 'from-green-400 to-emerald-500';
    if (match >= 80) return 'from-yellow-400 to-amber-500';
    if (match >= 70) return 'from-orange-400 to-red-500';
    return 'from-gray-400 to-gray-600';
  };

  return (
    <div className="glass-panel hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-accent-cyan/30 transition-all duration-500 group">
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl w-20 h-20 flex items-center justify-center bg-gradient-to-br from-accent-cyan/20 to-accent-gold/20 rounded-2xl border border-accent-silver/20 group-hover:border-accent-cyan transition-colors">
          {perfume.image}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-montserrat font-semibold text-xl mb-1">{perfume.name}</h3>
              <p className="text-accent-silver text-sm">{perfume.brand}</p>
            </div>
            <div className="text-right">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${getMatchColor(perfume.match)} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                {perfume.match}%
              </div>
              <p className="text-xs text-accent-silver mt-1">AI Match</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-accent-silver">
            <span>👃 {perfume.notes.length} notes</span>
            <span>⏱️ {perfume.longevity}</span>
            <span>💨 {perfume.sillage}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-accent-cyan text-sm mb-2">Key Notes:</h4>
        <div className="flex flex-wrap gap-2">
          {perfume.notes.slice(0, isExpanded ? perfume.notes.length : 4).map((note, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-accent-cyan/10 border border-accent-cyan rounded-full text-xs font-medium hover:bg-accent-cyan/20 transition-colors"
            >
              {note}
            </span>
          ))}
          {perfume.notes.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-white/5 border border-accent-silver/20 rounded-full text-xs text-accent-silver hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              {isExpanded ? 'Show Less' : `+${perfume.notes.length - 4} more`}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-accent-cyan text-sm mb-2">Description:</h4>
        <p className="text-sm text-accent-silver leading-relaxed">
          {perfume.description}
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-accent-silver/20">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-accent-gold text-lg">{perfume.price}</span>
          <div className="flex items-center gap-1 text-yellow-400">
            <span>★</span>
            <span className="text-sm">{perfume.rating}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm px-4 py-2">Details</button>
          <button className="btn-primary text-sm px-4 py-2">Buy Now</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 text-xs py-2 bg-white/5 border border-accent-silver/20 rounded-lg hover:border-accent-cyan hover:text-accent-cyan transition-colors">
          Save
        </button>
        <button className="flex-1 text-xs py-2 bg-white/5 border border-accent-silver/20 rounded-lg hover:border-accent-cyan hover:text-accent-cyan transition-colors">
          Compare
        </button>
        <button className="flex-1 text-xs py-2 bg-white/5 border border-accent-silver/20 rounded-lg hover:border-accent-cyan hover:text-accent-cyan transition-colors">
          Share
        </button>
      </div>
    </div>
  );
};

export default PerfumeCard;