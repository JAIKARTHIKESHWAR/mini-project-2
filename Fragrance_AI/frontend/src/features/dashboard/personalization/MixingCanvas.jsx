import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Droplets } from 'lucide-react';

// Color palette for each note (used for the gradient blob)
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

// Accord → color mapping for visual pills
const accordColors = {
  woody: 'bg-amber-900/30 text-amber-300 border-amber-600/30',
  fresh: 'bg-emerald-900/30 text-emerald-300 border-emerald-600/30',
  floral: 'bg-pink-900/30 text-pink-300 border-pink-600/30',
  citrus: 'bg-yellow-900/30 text-yellow-300 border-yellow-600/30',
  spicy: 'bg-red-900/30 text-red-300 border-red-600/30',
  sweet: 'bg-rose-900/30 text-rose-300 border-rose-600/30',
  musky: 'bg-slate-800/40 text-slate-300 border-slate-600/30',
  oriental: 'bg-orange-900/30 text-orange-300 border-orange-600/30',
  powdery: 'bg-violet-900/30 text-violet-300 border-violet-600/30',
  aromatic: 'bg-teal-900/30 text-teal-300 border-teal-600/30',
  amber: 'bg-amber-900/30 text-amber-200 border-amber-500/30',
  fruity: 'bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-600/30',
  animalic: 'bg-stone-800/40 text-stone-300 border-stone-600/30',
  default: 'bg-slate-800/30 text-slate-300 border-slate-600/30',
};

function getAccordStyle(accordName) {
  const lower = accordName.toLowerCase();
  for (const [key, cls] of Object.entries(accordColors)) {
    if (lower.includes(key)) return cls;
  }
  return accordColors.default;
}

const MixingCanvas = ({ selected, blendData, loading }) => {
  const [featuredIdx, setFeaturedIdx] = useState(0);

  // Gradient blob based on selected note colors
  const gradient = useMemo(() => {
    if (!selected.length) return 'linear-gradient(135deg, #0f172a, #111827)';
    const colors = selected.map((note) => palette[note] || '#cbd5e1');
    return `linear-gradient(135deg, ${colors.join(',')})`;
  }, [selected]);

  // Featured perfume (cycle through matching results)
  const perfumes = blendData?.matchingPerfumes || [];
  const featured = perfumes[featuredIdx % Math.max(perfumes.length, 1)] || null;
  const accords = blendData?.blendAccords || [];

  const hasValidImage = featured?.image &&
    !featured.image.includes('example.com') &&
    featured.image.startsWith('http');

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <p className="text-sm font-semibold text-foreground">Mixing Canvas</p>
        </div>
        {perfumes.length > 1 && (
          <button
            onClick={() => setFeaturedIdx((i) => (i + 1) % perfumes.length)}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Next match →
          </button>
        )}
      </div>

      {/* Main visual area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
        {selected.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
            <Droplets className="w-10 h-10 text-slate-500" />
            <p className="text-sm text-muted-foreground">
              Select notes from the palette to discover matching fragrances and accords.
            </p>
          </div>
        ) : loading ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-muted-foreground">Analyzing notes...</p>
          </div>
        ) : (
          /* Results */
          <>
            {/* Perfume image or gradient blob */}
            <AnimatePresence mode="wait">
              {hasValidImage ? (
                <motion.img
                  key={featured.image}
                  src={featured.image}
                  alt={featured.name}
                  className="h-40 w-auto max-w-[160px] rounded-2xl object-cover shadow-2xl border border-white/10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <motion.div
                  key="blob"
                  style={{ backgroundImage: gradient }}
                  className="h-40 w-32 rounded-[30px] shadow-2xl border border-white/20"
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Featured perfume name */}
            {featured && (
              <motion.div
                key={featured.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-sm font-semibold text-amber-300 leading-tight">
                  {featured.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {featured.brand}
                  {featured.matchScore > 1 && (
                    <span className="ml-1 text-amber-400">
                      · {featured.matchScore} note{featured.matchScore > 1 ? 's' : ''} matched
                    </span>
                  )}
                </p>
              </motion.div>
            )}

            {/* Blend accords */}
            {accords.length > 0 && (
              <div className="w-full mt-1">
                <p className="text-xs text-muted-foreground mb-2 text-center uppercase tracking-wider">
                  Blend Accords
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {accords.map((accord) => (
                    <motion.span
                      key={accord.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getAccordStyle(accord.name)}`}
                    >
                      {accord.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* No results message */}
            {perfumes.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                No matching fragrances found for this combination. Try different notes.
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        {selected.length > 0
          ? `${perfumes.length} fragrance${perfumes.length !== 1 ? 's' : ''} match your blend`
          : 'Select notes to start blending.'}
      </p>
    </div>
  );
};

export default MixingCanvas;
