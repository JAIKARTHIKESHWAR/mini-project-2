import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RecentRecommendations = () => {
  const navigate = useNavigate();

  const recommendations = [
    {
      id: 1,
      name: 'Dior Sauvage',
      brand: 'Christian Dior',
      match: 98,
      image: '/api/placeholder/80/80',
      notes: ['Bergamot', 'Ambroxan', 'Pepper'],
      price: 89.99,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Tom Ford Oud Wood',
      brand: 'Tom Ford',
      match: 92,
      image: '/api/placeholder/80/80',
      notes: ['Oud', 'Sandalwood', 'Rosewood'],
      price: 129.99,
      rating: 4.9
    },
    {
      id: 3,
      name: 'Bleu de Chanel',
      brand: 'Chanel',
      match: 88,
      image: '/api/placeholder/80/80',
      notes: ['Grapefruit', 'Ginger', 'Incense'],
      price: 79.99,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Creed Aventus',
      brand: 'Creed',
      match: 95,
      image: '/api/placeholder/80/80',
      notes: ['Pineapple', 'Birch', 'Musk'],
      price: 149.99,
      rating: 4.9
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Recommendations</h3>
        <button 
          onClick={() => navigate('/recommendations')}
          className="text-gold-400 hover:text-gold-300 text-sm font-medium flex items-center space-x-1 transition-colors"
        >
          <span>View All</span>
          <span className="material-icons text-base">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((perfume, index) => (
          <motion.div
            key={perfume.id}
            variants={itemVariants}
            whileHover={{ 
              y: -4,
              transition: { duration: 0.2 }
            }}
            className="group bg-gray-800/50 rounded-xl border border-gray-700 p-4 hover:border-gold-500/30 transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/shop/${perfume.id}`)}
          >
            <div className="flex items-center space-x-4">
              {/* Product Image Placeholder */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-white">spa</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-semibold text-sm truncate">{perfume.name}</h4>
                    <p className="text-gray-400 text-xs">{perfume.brand}</p>
                  </div>
                  <div className="flex items-center space-x-1 bg-gold-500/20 px-2 py-1 rounded-full">
                    <span className="text-gold-400 text-xs font-bold">{perfume.match}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(Math.floor(perfume.rating))}
                      <span className="text-gray-600">★</span>
                    </div>
                    <span className="text-gray-500 text-xs">{perfume.rating}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">${perfume.price}</span>
                </div>

                <div className="flex items-center space-x-1 mt-2">
                  {perfume.notes.slice(0, 2).map((note, noteIndex) => (
                    <span 
                      key={noteIndex}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                    >
                      {note}
                    </span>
                  ))}
                  {perfume.notes.length > 2 && (
                    <span className="text-gray-500 text-xs">+{perfume.notes.length - 2}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-gray-400 text-2xl">spa</span>
          </div>
          <h4 className="text-gray-300 font-semibold mb-2">No Recommendations Yet</h4>
          <p className="text-gray-500 text-sm mb-4">Start by taking our fragrance quiz</p>
          <button 
            onClick={() => navigate('/recommendations')}
            className="bg-gradient-to-r from-gold-500 to-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Get Started
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentRecommendations;