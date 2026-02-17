import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Wind, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Badge from '../../../components/ui/Badge';

const ScentResultPreview = ({ selected, blendData, loading }) => {
  const [expandedId, setExpandedId] = useState(null);

  const perfumes = blendData?.matchingPerfumes || [];
  const accords = blendData?.blendAccords || [];

  // Determine dominant fragrance family from top accord
  const topAccord = accords[0]?.name || null;
  const familyLabel = topAccord
    ? topAccord.charAt(0).toUpperCase() + topAccord.slice(1)
    : (selected.length > 0 ? 'Analyzing...' : 'No blend');

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 h-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Matching Fragrances</p>
        <Badge>{familyLabel}</Badge>
      </div>

      {/* Content area */}
      <div className="space-y-2 flex-1 overflow-auto pr-1 custom-scrollbar">
        {selected.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Select notes to find matching fragrances.
          </p>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
        ) : perfumes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No matching fragrances found. Try a different combination.
          </p>
        ) : (
          <AnimatePresence>
            {perfumes.map((perfume, idx) => {
              const isExpanded = expandedId === perfume.id;
              const hasImage = perfume.image &&
                !perfume.image.includes('example.com') &&
                perfume.image.startsWith('http');

              return (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden"
                >
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : perfume.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                  >
                    {/* Thumbnail */}
                    {hasImage ? (
                      <img
                        src={perfume.image}
                        alt={perfume.name}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/30 to-rose-500/30 border border-white/10 flex-shrink-0" />
                    )}

                    {/* Name + brand */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-tight">
                        {perfume.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {perfume.brand}
                        {perfume.matchScore > 0 && (
                          <span className="text-amber-400 ml-1">
                            · {perfume.matchScore} match{perfume.matchScore > 1 ? 'es' : ''}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Rating + expand */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {perfume.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-300">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {perfume.rating}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/5">
                          {/* Accords */}
                          {perfume.accords?.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Accords</p>
                              <div className="flex flex-wrap gap-1">
                                {perfume.accords.slice(0, 6).map((a) => (
                                  <span
                                    key={a}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                  >
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {perfume.notes && (
                            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                              {perfume.notes.top?.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground mb-0.5">Top</p>
                                  <p className="text-foreground">{perfume.notes.top.slice(0, 3).join(', ')}</p>
                                </div>
                              )}
                              {perfume.notes.middle?.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground mb-0.5">Heart</p>
                                  <p className="text-foreground">{perfume.notes.middle.slice(0, 3).join(', ')}</p>
                                </div>
                              )}
                              {perfume.notes.base?.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground mb-0.5">Base</p>
                                  <p className="text-foreground">{perfume.notes.base.slice(0, 3).join(', ')}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Performance row */}
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            {perfume.longevity && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {perfume.longevity}
                              </span>
                            )}
                            {perfume.sillage && (
                              <span className="flex items-center gap-0.5">
                                <Wind className="w-3 h-3" /> {perfume.sillage}
                              </span>
                            )}
                            {perfume.price && (
                              <span className="text-amber-300 ml-auto">
                                ₹{perfume.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-white/5">
        <span>{selected.length} note{selected.length !== 1 ? 's' : ''} selected</span>
        <span>{perfumes.length} match{perfumes.length !== 1 ? 'es' : ''}</span>
      </div>
    </div>
  );
};

export default ScentResultPreview;
