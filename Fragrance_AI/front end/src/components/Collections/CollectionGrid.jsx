import React from 'react';

const CollectionGrid = () => {
  const collections = [
    {
      id: 1,
      name: "Luxury Line",
      description: "Premium fragrances from exclusive houses",
      count: 24,
      icon: "💎",
      color: "from-purple-500 to-pink-600",
      trending: true
    },
    {
      id: 2,
      name: "Everyday Fresh",
      description: "Light and versatile daily scents",
      count: 18,
      icon: "🌿",
      color: "from-green-400 to-teal-500",
      trending: false
    },
    {
      id: 3,
      name: "Gym & Energy",
      description: "Active and invigorating fragrances",
      count: 12,
      icon: "💪",
      color: "from-orange-400 to-red-500",
      trending: true
    },
    {
      id: 4,
      name: "Romantic Nights",
      description: "Sensual and intimate evening scents",
      count: 16,
      icon: "🌹",
      color: "from-pink-400 to-rose-500",
      trending: false
    },
    {
      id: 5,
      name: "Professional Edge",
      description: "Sophisticated office-appropriate scents",
      count: 14,
      icon: "👔",
      color: "from-blue-400 to-indigo-500",
      trending: true
    },
    {
      id: 6,
      name: "Seasonal Specials",
      description: "Curated scents for every season",
      count: 20,
      icon: "🍂",
      color: "from-yellow-400 to-orange-500",
      trending: false
    },
    {
      id: 7,
      name: "Vintage Classics",
      description: "Timeless fragrances with heritage",
      count: 8,
      icon: "🕰️",
      color: "from-amber-600 to-yellow-700",
      trending: false
    },
    {
      id: 8,
      name: "Modern Innovators",
      description: "Cutting-edge contemporary scents",
      count: 15,
      icon: "🚀",
      color: "from-cyan-400 to-blue-500",
      trending: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {collections.map(collection => (
        <div 
          key={collection.id}
          className="glass-panel hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-accent-cyan/30 transition-all duration-500 group cursor-pointer"
        >
          {/* Collection Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${collection.color} flex items-center justify-center text-xl`}>
              {collection.icon}
            </div>
            {collection.trending && (
              <span className="text-xs bg-accent-cyan/20 text-accent-cyan px-2 py-1 rounded-full">
                Trending
              </span>
            )}
          </div>

          {/* Collection Info */}
          <div className="mb-4">
            <h3 className="font-montserrat font-semibold text-lg mb-2 group-hover:text-accent-cyan transition-colors">
              {collection.name}
            </h3>
            <p className="text-sm text-accent-silver leading-relaxed">
              {collection.description}
            </p>
          </div>

          {/* Collection Stats */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-accent-silver">
              {collection.count} fragrances
            </span>
            <button className="text-accent-cyan hover:text-accent-cyan/80 transition-colors text-sm font-medium">
              Explore →
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${collection.color} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min(collection.count * 4, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionGrid;