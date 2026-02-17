import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Flame, Leaf, Wind, Star, Blend } from 'lucide-react';

const suggestions = [
  {
    icon: Star,
    label: 'Find my perfect scent',
    prompt: "I'd like to find my perfect signature scent",
  },
  {
    icon: Flame,
    label: 'Bold & Confident',
    prompt: 'Recommend a bold and confident fragrance for a date night',
  },
  {
    icon: Leaf,
    label: 'Fresh & Woody',
    prompt: 'I want a fresh woody scent for everyday wear',
  },
  {
    icon: Droplets,
    label: 'Romantic scent',
    prompt: 'I want a romantic perfume for a special occasion',
  },
  {
    icon: Wind,
    label: 'Tell me about Dior Sauvage',
    prompt: 'Tell me about Dior Sauvage and its notes',
  },
  {
    icon: Blend,
    label: 'Mix bergamot & musk',
    prompt: 'What would bergamot, musk, and sandalwood smell like together?',
  },
];

const MaestroPromptSuggestions = ({ onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.button
            key={i}
            onClick={() => onSelect(s.prompt)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-200/80 border border-amber-400/15 bg-amber-400/5 hover:bg-amber-400/12 hover:border-amber-400/30 hover:text-amber-100 transition-all duration-200 cursor-pointer"
          >
            <Icon className="w-3 h-3 text-amber-400/60" />
            {s.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default MaestroPromptSuggestions;