import React, { useState } from 'react';
import ScentNotesPalette from './ScentNotesPalette';
import MixingCanvas from './MixingCanvas';
import ScentResultPreview from './ScentResultPreview';

const PersonalizationLabPage = () => {
  const [selected, setSelected] = useState(['Bergamot', 'Rose', 'Cedar']);

  const toggleNote = (note) => {
    setSelected((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.1em] text-amber-200">Personalization Lab</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Craft your blend</h1>
        <p className="text-sm text-slate-300">
          Select notes, adjust the mix, and preview your scent composition.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1">
          <ScentNotesPalette selected={selected} onToggle={toggleNote} />
        </div>
        <div className="xl:col-span-1">
          <MixingCanvas selected={selected} />
        </div>
        <div className="xl:col-span-1">
          <ScentResultPreview selected={selected} />
        </div>
      </div>
    </div>
  );
};

export default PersonalizationLabPage;

