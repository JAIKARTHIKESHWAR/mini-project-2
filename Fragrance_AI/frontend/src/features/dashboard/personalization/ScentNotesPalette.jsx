import React from 'react';
import { Leaf, Sun, Flame, Droplets, Flower2 } from 'lucide-react';
import Button from '../../../components/ui/Button';

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
  <div className="space-y-4">
    {categories.map((cat) => {
      const Icon = cat.icon;
      return (
        <div key={cat.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-5 w-5 text-amber-200" />
            <p className="text-sm font-semibold text-white">{cat.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cat.notes.map((note) => {
              const isActive = selected.includes(note);
              return (
                <Button
                  key={note}
                  variant={isActive ? 'default' : 'secondary'}
                  size="sm"
                  className="bg-white/5"
                  onClick={() => onToggle(note)}
                >
                  {note}
                </Button>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

export default ScentNotesPalette;

