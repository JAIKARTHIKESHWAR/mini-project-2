import React, { useState, useMemo } from 'react';
import MaestroChatWindow from './MaestroChatWindow';
import MaestroPromptSuggestions from './MaestroPromptSuggestions';
import useUserStore from '../state/useUserStore';

const MaestroPage = () => {
  const [preset, setPreset] = useState('');
  const { userId, userName, email, avatarUrl } = useUserStore();

  // Ensure userId is always available, even before profile API resolves
  const resolvedUserId = useMemo(() => {
    if (userId) return userId;
    try {
      const stored = localStorage.getItem('fragrance_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.id || null;
      }
    } catch { /* ignore */ }
    return null;
  }, [userId]);

  const user = {
    id: resolvedUserId,
    name: userName,
    email: email,
    photoURL: avatarUrl,
  };

  return (
    /*
      CRITICAL HEIGHT CHAIN:
      - This div must be h-full (fills the layout's content area)
      - The chat wrapper below is flex-1 min-h-0 so it stretches and allows
        inner scroll without overflowing the page
      - Your app root / router layout must also carry h-full → 100vh up the chain
    */
    <div className="flex flex-col h-full" style={{ gap: 12, padding: '8px 0 0 0' }}>
      {/* Page header */}
      <div className="flex-shrink-0 px-1">
        <p className="text-xs uppercase tracking-[0.15em] font-medium"
          style={{ color: 'rgba(251,191,36,0.65)' }}>
          Powered by AI
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight mt-0.5">
          Chat with Maestro
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Your personal fragrance expert — discover, customize, and find your signature scent.
        </p>
      </div>

      {/* Prompt chips */}
      <div className="flex-shrink-0 px-1">
        <MaestroPromptSuggestions onSelect={(prompt) => setPreset(prompt)} />
      </div>

      {/*
        Chat container:
        - flex-1 → takes all remaining vertical space
        - min-h-0 → REQUIRED for flex child with overflow scroll to work correctly
        - overflow-hidden → clips rounded corners of the inner chat window
      */}
      <div className="flex-1 overflow-hidden rounded-2xl" style={{ minHeight: 0 }}>
        <MaestroChatWindow
          presetMessage={preset}
          onPresetConsumed={() => setPreset('')}
          user={user}
        />
      </div>
    </div>
  );
};

export default MaestroPage;