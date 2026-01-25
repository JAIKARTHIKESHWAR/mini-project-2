import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const palette = {
  Bergamot: '#fbbf24',
  Grapefruit: '#fb7185',
  Lemon: '#fde047',
  Mint: '#22c55e',
  'Green Apple': '#4ade80',
  Rose: '#f472b6',
  Jasmine: '#c084fc',
  Lavender: '#818cf8',
  Iris: '#a78bfa',
  Peony: '#fb7185',
  Cedar: '#a16207',
  Sandalwood: '#d97706',
  Patchouli: '#92400e',
  Vetiver: '#0f766e',
  Musk: '#94a3b8',
  Amber: '#f59e0b',
  Tonka: '#eab308',
  Vanilla: '#f9a8d4',
  Oud: '#854d0e',
  Resins: '#f97316',
};

const MixingCanvas = ({ selected }) => {
  const gradient = useMemo(() => {
    if (!selected.length) return 'linear-gradient(135deg, #0f172a, #111827)';
    const colors = selected.map((note) => palette[note] || '#cbd5e1');
    return `linear-gradient(135deg, ${colors.join(',')})`;
  }, [selected]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 h-full">
      <p className="text-sm font-semibold text-white mb-3">Mixing canvas</p>
      <div className="relative h-64 flex items-center justify-center">
        <motion.div
          style={{ backgroundImage: gradient }}
          className="h-52 w-40 rounded-[30px] shadow-2xl border border-white/20"
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
        />
      </div>
      <p className="text-xs text-slate-300 text-center">
        {selected.length ? 'Blend evolving with selected notes.' : 'Select notes to start blending.'}
      </p>
    </div>
  );
};

export default MixingCanvas;

