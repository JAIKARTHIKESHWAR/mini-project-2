import React from 'react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const ScentResultPreview = ({ selected }) => {
  const families = ['Fresh', 'Woody', 'Floral', 'Oriental'];
  const family = families[selected.length % families.length];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Blend preview</p>
        <Badge>{family}</Badge>
      </div>
      <div className="space-y-2 flex-1 overflow-auto">
        {selected.length ? (
          selected.map((note) => (
            <div
              key={note}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              <span>{note}</span>
              <span className="text-xs text-slate-400">Intensity {Math.min(10, note.length)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No notes selected yet.</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button className="flex-1">Save preset</Button>
        <Button variant="secondary" className="flex-1">Share</Button>
      </div>
    </div>
  );
};

export default ScentResultPreview;

