import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Start AI Chat",
      description: "Get personalized fragrance recommendations",
      icon: "smart_toy",
      route: "/chat",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      title: "Create in Lab",
      description: "Design your custom perfume blend",
      icon: "science",
      route: "/lab",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      title: "Browse Shop",
      description: "Discover premium fragrances",
      icon: "storefront",
      route: "/shop",
      gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.route)}
            className={`w-full p-4 rounded-xl ${action.gradient} text-white text-left transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative z-10 flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-icons text-xl">{action.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{action.title}</h4>
                <p className="text-white/80 text-xs">{action.description}</p>
              </div>
              <span className="material-icons text-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                arrow_forward
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <p className="text-gray-300 text-sm">
            <span className="text-yellow-400 font-semibold">Pro Tip:</span> Start with AI Chat for personalized
            recommendations
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActions;
