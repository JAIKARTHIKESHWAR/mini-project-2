import React from 'react';

const FragranceCard = ({ fragrance }) => {
  return (
    <div className="glass-panel hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 group h-full flex flex-col relative overflow-hidden">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="flex items-start gap-3 sm:gap-4 mb-4 relative z-10">
        <div className="text-2xl sm:text-3xl lg:text-4xl w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl lg:rounded-2xl border border-purple-500/20 group-hover:border-purple-400 transition-colors">
          {fragrance.image}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg sm:text-xl mb-1 truncate">{fragrance.name}</h3>
          <p className="text-gray-300 text-xs sm:text-sm mb-3 truncate">{fragrance.brand}</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-lg">
              {fragrance.match}%
            </div>
            <span className="text-xs text-gray-300">AI Match</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex-1 relative z-10">
        <h4 className="font-semibold text-xs sm:text-sm mb-2 text-purple-400">Key Notes:</h4>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {fragrance.notes.map((note, index) => (
            <span 
              key={index} 
              className="px-2 sm:px-3 py-1 bg-purple-500/10 border border-purple-500 rounded-full text-xs font-medium hover:bg-purple-500/20 transition-colors text-purple-300"
            >
              {note}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-300/20 mt-auto relative z-10">
        <span className="font-semibold text-blue-400 text-base sm:text-lg">{fragrance.price}</span>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="btn-secondary text-xs px-4 py-2 w-20 sm:w-auto">Details</button>
          <button className="btn-primary text-xs px-4 py-2 w-20 sm:w-auto">Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default FragranceCard;