import React, { useState, useEffect, useCallback, useRef } from 'react';
import ScentNotesPalette from './ScentNotesPalette';
import MixingCanvas from './MixingCanvas';
import ScentResultPreview from './ScentResultPreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PersonalizationLabPage = () => {
  const [selected, setSelected] = useState([]);
  const [blendData, setBlendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const toggleNote = (note) => {
    setSelected((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  // Fetch blend data from backend when notes change (debounced)
  const fetchBlendData = useCallback(async (notes) => {
    if (notes.length === 0) {
      setBlendData(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/blend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to fetch blend');
      const data = await res.json();
      setBlendData(data);
    } catch (err) {
      console.error('Blend API error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce API calls — wait 500ms after last note toggle
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBlendData(selected);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [selected, fetchBlendData]);

  return (
    <div className="space-y-6 px-4 md:px-8 pb-10">
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-200/60 font-bold mb-1">Personalization Lab</p>
        <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Craft your blend</h1>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Select notes, adjust the mix, and preview your scent composition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3">
          <ScentNotesPalette selected={selected} onToggle={toggleNote} />
        </div>
        <div className="lg:col-span-5 h-[600px] lg:sticky lg:top-24">
          <MixingCanvas
            selected={selected}
            blendData={blendData}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-4 h-[600px] lg:sticky lg:top-24">
          <ScentResultPreview
            selected={selected}
            blendData={blendData}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalizationLabPage;
