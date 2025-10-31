import React, { useState } from 'react';

const RecommendationEngine = () => {
  const [filters, setFilters] = useState({
    scentFamily: '',
    occasion: '',
    season: '',
    priceRange: [0, 300],
    intensity: '',
    longevity: ''
  });

  const scentFamilies = ['Floral', 'Woody', 'Citrus', 'Fresh', 'Spicy', 'Sweet', 'Oriental'];
  const occasions = ['Work', 'Date', 'Evening', 'Casual', 'Special', 'Everyday'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];
  const intensities = ['Soft', 'Moderate', 'Strong', 'Very Strong'];
  const longevities = ['2-4 hours', '4-6 hours', '6-8 hours', '8+ hours'];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePriceChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const clearFilters = () => {
    setFilters({
      scentFamily: '',
      occasion: '',
      season: '',
      priceRange: [0, 300],
      intensity: '',
      longevity: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(val => 
    Array.isArray(val) ? val[0] > 0 || val[1] < 300 : val !== ''
  ).length;

  return (
    <div className="glass-panel">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-montserrat font-semibold">🔍 Recommendation Engine</h3>
          <p className="text-accent-silver">Fine-tune your fragrance discovery</p>
        </div>
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <span className="text-sm text-accent-cyan bg-accent-cyan/10 px-3 py-1 rounded-full">
              {activeFiltersCount} active filters
            </span>
          )}
          <button 
            onClick={clearFilters}
            className="text-sm text-accent-silver hover:text-accent-cyan transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Scent Family Filter */}
        <div>
          <label className="block text-sm font-medium text-accent-silver mb-2">
            Scent Family
          </label>
          <select
            value={filters.scentFamily}
            onChange={(e) => handleFilterChange('scentFamily', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
          >
            <option value="">All Families</option>
            {scentFamilies.map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>

        {/* Occasion Filter */}
        <div>
          <label className="block text-sm font-medium text-accent-silver mb-2">
            Occasion
          </label>
          <select
            value={filters.occasion}
            onChange={(e) => handleFilterChange('occasion', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
          >
            <option value="">All Occasions</option>
            {occasions.map(occasion => (
              <option key={occasion} value={occasion}>{occasion}</option>
            ))}
          </select>
        </div>

        {/* Season Filter */}
        <div>
          <label className="block text-sm font-medium text-accent-silver mb-2">
            Season
          </label>
          <select
            value={filters.season}
            onChange={(e) => handleFilterChange('season', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
          >
            <option value="">All Seasons</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-accent-silver mb-2">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="300"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), filters.priceRange[1])}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            />
            <input
              type="range"
              min="0"
              max="300"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceChange(filters.priceRange[0], parseInt(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="flex justify-between text-xs text-accent-silver mt-1">
            <span>$0</span>
            <span>$150</span>
            <span>$300+</span>
          </div>
        </div>

        {/* Intensity Filter */}
        <div>
          <label className="block text-sm font-medium text-accent-silver mb-2">
            Intensity
          </label>
          <select
            value={filters.intensity}
            onChange={(e) => handleFilterChange('intensity', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
          >
            <option value="">Any Intensity</option>
            {intensities.map(intensity => (
              <option key={intensity} value={intensity}>{intensity}</option>
            ))}
          </select>
        </div>

        {/* Longevity Filter */}
        <div>
          <label className="block text-sm font-medium text-accent-silver mb-2">
            Longevity
          </label>
          <select
            value={filters.longevity}
            onChange={(e) => handleFilterChange('longevity', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none transition-colors"
          >
            <option value="">Any Longevity</option>
            {longevities.map(longevity => (
              <option key={longevity} value={longevity}>{longevity}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-accent-silver mb-2">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {['Best Sellers', 'New Arrivals', 'Under $50', 'Long Lasting', 'Office Safe', 'Date Night'].map(filter => (
            <button
              key={filter}
              className="px-3 py-1 bg-white/5 border border-accent-silver/20 rounded-full text-xs text-accent-silver hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-accent-cyan">AI Analysis Complete</h4>
            <p className="text-sm text-accent-silver">Found 24 fragrances matching your criteria</p>
          </div>
          <button className="btn-primary text-sm px-4 py-2">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationEngine;