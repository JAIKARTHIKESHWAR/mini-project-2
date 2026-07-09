import React from 'react';
import { Leaf, Sun, Flame, Flower2 } from 'lucide-react';

// These palettes mirror a classic fragrance pyramid (top / heart / base)
// plus common accords used in the database for filtering.
const categories = [
  {
    name: 'Top',
    subtitle: 'First impression · bright & opening',
    icon: Sun,
    notes: [
      'Bergamot',
      'Grapefruit',
      'Lemon',
      'Lime',
      'Orange',
      'Mandarin',
      'Neroli',
      'Petitgrain',
      'Green Apple',
      'Pear',
      'Pineapple',
      'Blackcurrant',
      'Pink Pepper',
      'Aldehydes',
      'Mint',
      'Ginger',
      'Cardamom',
    ],
  },
  {
    name: 'Heart',
    subtitle: 'Signature character · floral & spicy',
    icon: Flower2,
    notes: [
      'Rose',
      'Turkish Rose',
      'Damask Rose',
      'Jasmine',
      'Jasmine Sambac',
      'Orange Blossom',
      'Tuberose',
      'Ylang-Ylang',
      'Lavender',
      'Iris',
      'Violet',
      'Peony',
      'Geranium',
      'Carnation',
      'Clove',
      'Cinnamon',
      'Nutmeg',
      'Black Pepper',
    ],
  },
  {
    name: 'Base',
    subtitle: 'Depth & longevity · woods & resins',
    icon: Leaf,
    notes: [
      'Cedar',
      'Sandalwood',
      'Patchouli',
      'Vetiver',
      'Guaiac Wood',
      'Oakmoss',
      'Musk',
      'White Musk',
      'Amber',
      'Ambergris',
      'Vanilla',
      'Tonka Bean',
      'Benzoin',
      'Labdanum',
      'Oud',
      'Incense',
      'Leather',
      'Cashmere Wood',
    ],
  },
  {
    name: 'Accords',
    subtitle: 'Overall impression · how it feels',
    icon: Flame,
    notes: [
      'Citrus',
      'Fresh',
      'Green',
      'Aromatic',
      'Aquatic',
      'Floral',
      'White Floral',
      'Rose',
      'Fruity',
      'Woody',
      'Amber',
      'Musk',
      'Spicy',
      'Warm Spicy',
      'Sweet',
      'Gourmand',
      'Powdery',
      'Balsamic',
      'Smoky',
      'Leathery',
    ],
  },
];

const ScentNotesPalette = ({ selected, onToggle }) => (
  <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar-black">
    {categories.map((cat) => {
      const Icon = cat.icon;
      return (
        <div
          key={cat.name}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/3 to-transparent p-3 shadow-sm shadow-black/20"
        >
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-amber-300" />
              <p className="text-xs font-semibold text-foreground">{cat.name}</p>
            </div>
            {cat.subtitle && (
              <p className="text-[10px] text-muted-foreground/80 text-right">
                {cat.subtitle}
              </p>
            )}
          </div>
          <div className="max-h-[120px] overflow-y-auto pr-1 custom-scrollbar-black flex flex-wrap gap-1.5">
            {cat.notes.map((note) => {
              const isActive = selected.includes(note);
              return (
                <button
                  key={note}
                  onClick={() => onToggle(note)}
                  className={`
                    px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 border
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
