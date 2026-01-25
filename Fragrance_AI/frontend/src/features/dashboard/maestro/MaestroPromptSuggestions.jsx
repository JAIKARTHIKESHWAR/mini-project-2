import React from 'react';
import Button from '../../../components/ui/Button';

const prompts = [
  'Suggest a fresh office scent under $150',
  'Create a date-night blend with rose + vanilla',
  'What are top fall/winter perfumes?',
  'Recommend clean, skin-like fragrances',
];

const MaestroPromptSuggestions = ({ onSelect }) => (
  <div className="flex flex-wrap gap-2">
    {prompts.map((prompt) => (
      <Button
        key={prompt}
        variant="secondary"
        size="sm"
        className="bg-white/5 hover:bg-white/10"
        onClick={() => onSelect?.(prompt)}
      >
        {prompt}
      </Button>
    ))}
  </div>
);

export default MaestroPromptSuggestions;

