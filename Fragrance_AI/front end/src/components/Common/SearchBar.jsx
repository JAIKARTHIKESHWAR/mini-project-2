import React, { useState } from 'react';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
      <input
        type="text"
        placeholder="🔍 Search fragrances, notes, brands..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-6 py-3 bg-white/10 border border-accent-silver/30 rounded-full text-white placeholder-accent-silver focus:outline-none focus:border-accent-cyan focus:shadow-lg focus:shadow-accent-cyan/20 transition-all duration-300"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent-silver hover:text-white transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;