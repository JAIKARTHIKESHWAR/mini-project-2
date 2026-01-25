import React, { useState } from 'react';
import MaestroChatWindow from './MaestroChatWindow';
import MaestroPromptSuggestions from './MaestroPromptSuggestions';
import Card from '../../../components/ui/Card';

const MaestroPage = () => {
  const [preset, setPreset] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.1em] text-amber-200">Maestro</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Chat with Maestro</h1>
        <p className="text-sm text-slate-300">Ask for guidance, blends, and shopping help.</p>
      </div>

      <MaestroPromptSuggestions onSelect={(prompt) => setPreset(prompt)} />

      <Card className="p-0">
        <MaestroChatWindow
          presetMessage={preset}
          onPresetConsumed={() => setPreset('')}
        />
      </Card>
    </div>
  );
};

export default MaestroPage;

