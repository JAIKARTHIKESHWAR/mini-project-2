import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const StatsCard = ({ title, value, icon, trend, color, description, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="relative group"
    >
      {/* Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition duration-300`}></div>
      
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
            <span className="material-icons text-white text-xl">{icon}</span>
          </div>
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
            {trend}
          </span>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-end justify-between">
            <motion.p 
              className="text-3xl font-bold text-white"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.p>
          </div>
          <p className="text-gray-500 text-xs mt-2">{description}</p>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-lg"></div>
      </div>
    </motion.div>
  );
};

export default StatsCard;