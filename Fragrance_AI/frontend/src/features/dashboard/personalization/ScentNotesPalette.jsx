import React from 'react';
import { Leaf, Sun, Flame, Flower2 } from 'lucide-react';

const categories = [
  {
    name: 'Top',
    icon: Sun,
    notes: ['Bergamot', 'Grapefruit', 'Lemon', 'Mint', 'Green Apple'],
  },
  {
    name: 'Heart',
    icon: Flower2,
    notes: ['Rose', 'Jasmine', 'Lavender', 'Iris', 'Peony'],
  },
  {
    name: 'Base',
    icon: Leaf,
    notes: ['Cedar', 'Sandalwood', 'Patchouli', 'Vetiver', 'Musk'],
  },
  {
    name: 'Fixatives',
    icon: Flame,
    notes: ['Amber', 'Tonka', 'Vanilla', 'Oud', 'Resins'],
  },
];

const ScentNotesPalette = ({ selected, onToggle }) => (
  <div className="space-y-3">
    {categories.map((cat) => {
      const Icon = cat.icon;
      return (
        <div key={cat.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-4 w-4 text-amber-300" />
            <p className="text-sm font-semibold text-foreground">{cat.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cat.notes.map((note) => {
              const isActive = selected.includes(note);
              return (
                <button
                  key={note}
                  onClick={() => onToggle(note)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                    ${isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground'
                    }
                  `}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

export default ScentNotesPalette;
