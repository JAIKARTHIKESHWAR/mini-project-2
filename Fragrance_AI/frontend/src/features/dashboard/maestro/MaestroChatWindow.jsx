import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';

const MaestroChatWindow = ({ presetMessage, onPresetConsumed }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hi, I am Maestro. How can I help with your next signature scent?' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (presetMessage) {
      setInput(presetMessage);
      onPresetConsumed?.();
    }
  }, [presetMessage, onPresetConsumed]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMessage = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Try a blend of bergamot, orris, and cedar for a clean yet sophisticated vibe.',
        },
      ]);
    }, 600);
  };

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <Avatar
                size="sm"
                fallback="M"
                className="bg-amber-400/30 text-amber-100 border-amber-400/30"
              />
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-white/10 text-white border border-white/10'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/10 p-3 flex items-center gap-2">
        <Input
          id="maestro-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Maestro anything about perfumes..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button variant="secondary">
          <Mic className="h-4 w-4" />
        </Button>
        <Button onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MaestroChatWindow;

