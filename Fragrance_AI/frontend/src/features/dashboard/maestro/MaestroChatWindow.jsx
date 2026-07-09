import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, History } from 'lucide-react';
import ChatHistoryDrawer from './ChatHistoryDrawer';
import ProductLogo from '../../../logo/favicon_ai.png';
// import BannerLogo from '../../../logo/Fragrance_AI logo.jpg';
import SplashLogo from '../../../logo/Logo_Fragrance.png';
import favicon_ai from '../../../logo/favicon_ai.png';
import NearbyShopsMap from '../../../components/map/NearbyShopsMap';
import MaestroPromptSuggestions from './MaestroPromptSuggestions';
import { Copy, Check } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const GREETING_INTRO =
  "Hello! I'm Maestro, your personal fragrance advisor. It's a pleasure to have you here. How can I help you today?";

const ABOUT_RESPONSE =
  "I'm Maestro — your personal AI fragrance advisor. I can help you discover signature scents, explore perfumes by mood or occasion, decode notes and accords, and find the perfect fragrance for any moment.\n\nWhat would you like to explore today?";

const PROFILING_QUESTIONS = [
  {
    id: 'mood',
    question: 'What mood are you going for?',
    label: 'Mood',
    options: [
      { label: 'Confident & Bold', desc: 'Strong, assertive, commanding presence' },
      { label: 'Romantic & Sensual', desc: 'Warm, intimate, deeply captivating' },
      { label: 'Fresh & Energetic', desc: 'Light, vibrant, full of life' },
      { label: 'Calm & Mysterious', desc: 'Subtle, deep, intriguing' },
      { label: 'Playful & Fun', desc: 'Joyful, carefree, uplifting' },
    ],
  },
  {
    id: 'occasion',
    question: 'What is the occasion?',
    label: 'Occasion',
    options: [
      { label: 'Date Night', desc: 'Romantic evening, close encounters' },
      { label: 'Office & Work', desc: 'Professional, subtle, appropriate' },
      { label: 'Party', desc: 'Bold and memorable in a crowd' },
      { label: 'Everyday Casual', desc: 'Comfortable, easy, effortless' },
      { label: 'Special Event', desc: 'Milestone moments, celebrations' },
      { label: 'Sport & Outdoor', desc: 'Fresh, clean, active energy' },
    ],
  },
  {
    id: 'longevity',
    question: 'How long do you need the fragrance to last?',
    label: 'Longevity',
    options: [
      { label: 'All Day (8h+)', desc: 'Morning to night, one application' },
      { label: 'Half Day (4–6h)', desc: 'Afternoon and evening wear' },
      { label: 'A Few Hours (2–3h)', desc: 'Light, occasional wear' },
    ],
  },
  {
    id: 'strength',
    question: 'How strong do you prefer your fragrance?',
    label: 'Strength',
    options: [
      { label: 'Strong & Powerful', desc: 'Fills the room, bold sillage' },
      { label: 'Moderate & Balanced', desc: 'Noticeable but not overwhelming' },
      { label: 'Mild & Subtle', desc: 'Close to skin, personal' },
      { label: 'Very Light & Airy', desc: 'Barely-there, delicate' },
    ],
  },
  {
    id: 'style',
    question: 'What is your personal style?',
    label: 'Style',
    options: [
      { label: 'Formal & Classic', desc: 'Timeless elegance, polished' },
      { label: 'Smart Casual', desc: 'Refined yet relaxed' },
      { label: 'Streetwear', desc: 'Urban edge, contemporary cool' },
      { label: 'Bohemian', desc: 'Free-spirited, natural, artistic' },
      { label: 'Minimalist', desc: 'Clean lines, understated beauty' },
      { label: 'Sporty & Active', desc: 'Dynamic, fresh, on-the-move' },
    ],
  },
];

const POST_FIRST_CHIPS = [
  { label: 'Discover my perfect scent', prompt: 'I would like to discover my perfect signature scent' },
  { label: 'Customize a scent', prompt: 'Help me customize a fragrance blend' },
  { label: 'Explore by mood', prompt: 'Recommend a fragrance based on my mood' },
  { label: 'Ask about a perfume', prompt: 'Tell me about a specific perfume' },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function isPositiveResponse(t) {
  const s = t.toLowerCase().trim();
  return ['yes', 'sure', 'ok', 'okay', "let's", 'yep', 'yup', 'why not', 'of course',
    'absolutely', 'go ahead', 'please', 'find', 'discover', 'start', 'begin',
    'perfect scent', 'signature scent', 'help me'].some(p => s.includes(p));
}

function isGreetingOrAbout(t) {
  const s = t.toLowerCase().trim();
  return s.length < 60 && ['hi', 'hello', 'hey', 'hiya', 'good morning', 'good evening',
    'good afternoon', "what's up", 'sup', 'who are you', 'what are you',
    'tell me about you', 'how can you help', 'what can you do', 'introduce'].some(p => s.includes(p));
}

function isDeclineResponse(t) {
  const s = t.toLowerCase().trim();
  // Match exact or near-exact decline phrases
  const declinePhrases = [
    'no thanks', 'no thank you', 'nope', 'not now', 'maybe later',
    "that's okay", "thats okay", "i'm good", 'im good', 'no need',
    'not interested', 'skip', 'pass', 'no, thanks', 'no, thank you',
  ];
  return declinePhrases.some(p => s === p || s.startsWith(p));
}

function getInitials(name) {
  return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function stringToHue(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

function detectAnswerChips(text) {
  const t = text.toLowerCase();
  const chips = [];

  // ── Detect what the AI is offering and build matching chips ──

  // Price-related offers
  if (t.includes('price')) {
    chips.push({ label: 'Show price', prompt: 'Yes, show me the price' });
  }

  // Performance-related offers
  if (t.includes('performance') || t.includes('longevity') || t.includes('sillage')) {
    chips.push({ label: 'Show performance', prompt: 'Yes, show me the performance and longevity details' });
  }

  // Season / occasion offers
  if (t.includes('season') || t.includes('occasion') || t.includes('when to wear')) {
    chips.push({ label: 'Best occasions', prompt: 'Yes, when is the best time and occasion to wear it?' });
  }

  // Accords / notes offers
  if (t.includes('accord') || t.includes('notes')) {
    chips.push({ label: 'Show accords & notes', prompt: 'Yes, show me the accords and notes' });
  }

  // Rating offers
  if (t.includes('rating')) {
    chips.push({ label: 'Show ratings', prompt: 'Yes, show me the ratings' });
  }

  // Explore / recommendation offers
  if (t.includes('explore') || t.includes('more fragrance') || t.includes('other fragrance') ||
    t.includes('more options') || t.includes('alternatives')) {
    chips.push({ label: 'Explore more', prompt: 'Show me more fragrances' });
  }
  
  // Buying/availability
  if (t.includes('buy') || t.includes('purchase') || t.includes('where to find') || t.includes('availability')) {
    chips.push({ label: 'Find Nearby Shops', prompt: 'Find Nearby Perfume Shops' });
  }

  // Specific perfume offers
  if (t.includes('specific perfume') || t.includes('which one')) {
    chips.push({ label: 'Tell me more', prompt: 'Yes, tell me more about it' });
  }

  // If we detected any offerings, add a "No thanks" option
  if (chips.length > 0) {
    chips.push({ label: 'No thanks', prompt: 'No thanks' });
  }

  // Fallback: if the AI asked a question but we didn't detect specifics
  if (chips.length === 0 && (t.includes('would you like') || t.includes('would you prefer') || t.includes('shall i'))) {
    chips.push(
      { label: 'Yes, tell me more', prompt: 'Yes, tell me more' },
      { label: 'No thanks', prompt: 'No thanks' },
    );
  }

  return chips;
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

// ── COMPONENTS ──

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="mt-1.5 flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-500" />
          <span className="text-emerald-500/80">Copied</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

const MaestroAvatar = ({ size = 36 }) => (
  <div className="relative flex-shrink-0">
    <div
      className="rounded-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center overflow-hidden shadow-lg border-2 border-slate-600/40"
      style={{ width: size, height: size }}
    >
      <img src={ProductLogo} alt="M" className="w-full h-full object-cover"
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
      <span className="hidden w-full h-full items-center justify-center text-amber-300 font-black text-sm">M</span>
    </div>
    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0b1220]" />
  </div>
);

const UserAvatar = ({ user }) => {
  const name = user?.name || user?.displayName || user?.email || 'User';
  const photoURL = user?.photoURL || user?.avatar || user?.picture || null;
  const initials = getInitials(name);
  const hue = stringToHue(name);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 shadow-md">
      {photoURL && !imgFailed ? (
        <img src={photoURL} alt={name} className="w-full h-full object-cover"
          onError={() => setImgFailed(true)} />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: `hsl(${hue},60%,38%)` }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

const TypewriterText = ({ text, speed = 13, onDone }) => {
  const [shown, setShown] = useState('');
  const idx = useRef(0);
  useEffect(() => {
    idx.current = 0;
    setShown('');
    const iv = setInterval(() => {
      if (idx.current < text.length) { setShown(text.slice(0, idx.current + 1)); idx.current++; }
      else { clearInterval(iv); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return (
    <span className="whitespace-pre-wrap leading-[1.65]">
      {shown}
      {shown.length < text.length && (
        <span className="inline-block w-0.5 h-[1.1em] bg-amber-400 ml-0.5 align-middle animate-pulse rounded-full" />
      )}
    </span>
  );
};

const FormattedText = ({ text }) => {
  // Parse inline markdown: **bold**, *italic*
  const parseInline = (str) => {
    return str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={j} className="font-semibold text-amber-300">{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*'))
        return <em key={j} className="text-amber-200/80">{part.slice(1, -1)}</em>;
      return <span key={j}>{part}</span>;
    });
  };

  return (
    <div className="text-sm leading-[1.65] space-y-2.5">
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;
        if (/^[-─━]{3,}$/.test(trimmed)) return <hr key={i} className="border-white/8 my-2" />;

        // Numbered list items (1. 2. 3.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2.5 pl-1">
              <span className="text-amber-400/60 font-medium flex-shrink-0 w-4 text-right">{numMatch[1]}.</span>
              <span className="flex-1">{parseInline(numMatch[2])}</span>
            </div>
          );
        }

        // Bullet points (- or •)
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2.5 pl-1">
              <span className="text-amber-400/50 flex-shrink-0 mt-0.5">•</span>
              <span className="flex-1">{parseInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        return <p key={i}>{parseInline(trimmed)}</p>;
      })}
    </div>
  );
};

const TypingDots = () => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
    className="flex gap-3 items-end">
    <MaestroAvatar />
    <div className="rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5 border border-white/8"
      style={{ background: 'rgba(255,255,255,0.06)' }}>
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.span key={i} className="block w-2 h-2 rounded-full"
          style={{ background: 'rgba(251,191,36,0.7)' }}
          animate={{ y: [0, -7, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.75, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING GOLDEN OPTION PILLS
// ─────────────────────────────────────────────────────────────────────────────
const OptionPills = ({ options, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="mt-1 flex flex-wrap gap-2"
  >
    {options.map((opt, i) => (
      <motion.button
        key={opt.label}
        onClick={() => onSelect(opt.label)}
        initial={{ opacity: 0, y: 8, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.07 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="relative px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-250 group"
        style={{
          background: 'rgba(251,191,36,0.07)',
          border: '1px solid rgba(251,191,36,0.25)',
          color: 'rgba(251,191,36,0.85)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(251,191,36,0.14)';
          e.currentTarget.style.border = '1px solid rgba(251,191,36,0.65)';
          e.currentTarget.style.color = 'rgb(251,191,36)';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(251,191,36,0.22), 0 0 4px rgba(251,191,36,0.12) inset';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(251,191,36,0.07)';
          e.currentTarget.style.border = '1px solid rgba(251,191,36,0.25)';
          e.currentTarget.style.color = 'rgba(251,191,36,0.85)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {opt.label}
      </motion.button>
    ))}
  </motion.div>
);

// Suggestion chips (post-first-msg) — styled as "small tags"
const SuggestionChips = ({ suggestions, onSelect }) => (
  <motion.div
    className="mt-1 flex flex-wrap gap-1.5 min-h-[30px]"
  >
    {suggestions.map((s, i) => (
      <motion.button
        key={s.label}
        onClick={() => onSelect(s.prompt)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 * i }}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="px-2.5 py-1 text-[10px] font-medium rounded-lg cursor-pointer transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.4)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(251,191,36,0.08)';
          e.currentTarget.style.border = '1px solid rgba(251,191,36,0.25)';
          e.currentTarget.style.color = 'rgba(251,191,36,0.8)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        }}
      >
        {s.label}
      </motion.button>
    ))}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FULL-PAGE INTRO SPLASH — zoom from outside → center
// ─────────────────────────────────────────────────────────────────────────────
const IntroSplash = ({ onDone }) => {
  const [phase, setPhase] = useState('enter'); // enter → name → tagline → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('name'), 700);
    const t2 = setTimeout(() => setPhase('tagline'), 1500);
    const t3 = setTimeout(() => setPhase('exit'), 2900);
    const t4 = setTimeout(() => onDone(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{ background: 'radial-gradient(ellipse at center, #0f1e3a 0%, #060c18 55%, #020509 100%)' }}
    >
      {/* Radial glow rings */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 600, height: 600, marginLeft: -300, marginTop: -300,
            background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full border border-amber-400/10"
          style={{ width: 360, height: 360, marginLeft: -180, marginTop: -180 }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </div>

      <motion.div
        initial={{ scale: 2.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
        className="w-64 h-64 mb-8"
        style={{
          background: 'transparent',
        }}
      >
        <img src={favicon_ai} alt="Maestro" className="w-full h-full object-contain" />
      </motion.div>

      {/* Brand name — slides up and expands */}
      <AnimatePresence>
        {(phase === 'name' || phase === 'tagline' || phase === 'exit') && (
          <motion.h1
            initial={{ opacity: 0, y: 20, letterSpacing: '0.05em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.28em' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-6xl font-bold text-white uppercase mb-3"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            MAESTRO
          </motion.h1>
        )}
      </AnimatePresence>

      {/* Divider line */}
      <AnimatePresence>
        {(phase === 'tagline' || phase === 'exit') && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3"
            style={{ width: 180, height: 1, background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)' }}
          />
        )}
      </AnimatePresence>

      {/* Tagline */}
      <AnimatePresence>
        {(phase === 'tagline' || phase === 'exit') && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="text-xs tracking-[0.35em] uppercase"
            style={{ color: 'rgba(251,191,36,0.6)' }}
          >
            Your Fragrance Advisor
          </motion.p>
        )}
      </AnimatePresence>

      {/* Corner flourishes */}
      {[
        'top-6 left-6 border-t border-l',
        'top-6 right-6 border-t border-r',
        'bottom-6 left-6 border-b border-l',
        'bottom-6 right-6 border-b border-r',
      ].map((cls, i) => (
        <motion.div key={i}
          className={`absolute w-8 h-8 ${cls}`}
          style={{ borderColor: 'rgba(251,191,36,0.2)' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
        />
      ))}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const MaestroChatWindow = ({ presetMessage, onPresetConsumed, user }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [chatReady, setChatReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const userMsgCount = useRef(0);
  const profilingStep = useRef(null);
  const profilingAnswers = useRef({});
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Inject preset from suggestion bar
  useEffect(() => {
    if (presetMessage && chatReady) {
      setInput(presetMessage);
      onPresetConsumed?.();
      inputRef.current?.focus();
    }
  }, [presetMessage, chatReady]);

  // Persist active Maestro session ID across refreshes
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem('maestro_active_session', sessionId);
    } catch {
      // ignore persistence errors
    }
  }, [sessionId]);

  const handleIntroDone = () => {
    setChatReady(true);
    const id = Date.now();
    setTimeout(() => {
      setMessages([{
        id, role: 'assistant', text: GREETING_INTRO,
        isStreaming: false, optionCards: null, chips: POST_FIRST_CHIPS,
      }]);
    }, 150);
  };

  const handleStreamDone = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStreaming: false } : m));
  };

  const handleSelectSession = async (sid) => {
    if (!sid) {
      // Start new chat — reset everything
      setSessionId(null);
      try { localStorage.removeItem('maestro_active_session'); } catch {}
      setMessages([]);
      userMsgCount.current = 0;
      profilingStep.current = null;
      profilingAnswers.current = {};
      // Show greeting immediately without full intro splash
      setChatReady(true);
      setShowIntro(false);
      setTimeout(() => {
        setMessages([{
          id: Date.now(), role: 'assistant', text: GREETING_INTRO,
          isStreaming: false, optionCards: null, chips: POST_FIRST_CHIPS,
        }]);
      }, 150);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/sessions/chat/${sid}`);
      if (!res.ok) throw new Error('Failed to load chat');
      const hist = await res.json();

      // Map backend msg to frontend format
      const formatted = hist.map(m => ({
        id: m.id || m._id,
        role: m.role,
        text: m.text || m.content,
        showNearbyMap: m.showNearbyMap || false, // ← MAP the flag
        isStreaming: false,
        optionCards: null,
        chips: null
      }));

      setMessages(formatted);
      setSessionId(sid);
      setChatReady(true);
      setShowIntro(false);
      userMsgCount.current = formatted.filter(m => m.role === 'user').length;
      profilingStep.current = null; // Reset profiling when loading a session
      profilingAnswers.current = {};
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Restore last active session automatically on mount (if user is still logged in)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('maestro_active_session');
      if (saved) {
        setShowIntro(false);
        setChatReady(true);
        handleSelectSession(saved);
      }
    } catch {
      // if anything fails, fall back to normal intro flow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── API call helper ────────────────────────────────────────────────────────
  const callAPI = async (query, currentMessages) => {
    // Resolve userId — prefer prop, fallback to localStorage
    let resolvedUserId = user?.id;
    if (!resolvedUserId) {
      try {
        const stored = localStorage.getItem('fragrance_user');
        if (stored) resolvedUserId = JSON.parse(stored).id;
      } catch { /* ignore */ }
    }

    const history = currentMessages
      .filter(m => !m.isStreaming)
      .map(m => ({ role: m.role, content: m.text }));

    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/ask`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          conversationHistory: history,
          sessionId,
          userId: resolvedUserId
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API request failed');
    // Update session ID if new one created
    if (data.sessionId) setSessionId(data.sessionId);
    return { answer: data.answer, showNearbyMap: data.showNearbyMap }; // ← RETURN full object
  };

  // ── Core send ──────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const trimmed = text.trim();
    const isFirstMsg = userMsgCount.current === 0;
    userMsgCount.current++;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed, optionCards: null, chips: null };
    // Capture current messages BEFORE setState for use in API calls
    const currentMessages = [...messages];
    setMessages(prev => [...prev, userMsg]);

    // ── 1. Pure greeting → local warm response, no scent push ────────────
    if (isGreetingOrAbout(trimmed) && profilingStep.current === null) {
      const id = Date.now() + 1;
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id, role: 'assistant', text: ABOUT_RESPONSE,
          isStreaming: false, optionCards: null,
          chips: [
            { label: 'Find my perfect scent', prompt: 'I would like to find my perfect signature scent' },
            { label: 'Ask about a perfume', prompt: 'Tell me about a specific perfume' },
            { label: 'Explore by mood', prompt: 'Recommend a fragrance based on my mood' },
          ],
        }]);
      }, 320);
      return;
    }

    // ── 1b. Decline / No Thanks (outside profiling) → stop gently ────────
    if (isDeclineResponse(trimmed) && profilingStep.current === null) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          text: "Of course. I'll pause here — whenever you're ready to talk about fragrances again, just let me know what you're looking for.",
          isStreaming: false,
          optionCards: null,
          chips: null,
        }]);
      }, 280);
      return;
    }

    // ── 1c. Map Intercept (Find Nearby Perfume Shops) ─────────────────────
    const lowerText = trimmed.toLowerCase();
    const mapPhrases = [
      'nearby perfume shop',
      'nearby perfume store',
      'near me perfume shop',
      'near me perfume store',
      'nearby shop for perfumes',
      'nearby shop for perfume',
      'nearby perfume shops',
      'nearby fragrance shop',
      'perfume shop near me',
      'perfume stores near me',
      'local perfume shop',
      'find nearby perfume shops',
      'find nearby shop for perfumes',
      'find nearby shop for perfume',
      'nearby scent shop',
    ];

    const wantsMap = mapPhrases.some(p => lowerText.includes(p)) ||
      (lowerText.includes('nearby') && (lowerText.includes('perfume') || lowerText.includes('fragrance') || lowerText.includes('scent')) && lowerText.includes('shop'));

    if (wantsMap) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant', 
          text: "Here are some of the best perfume shops near you. Please ensure your location is enabled.",
          isStreaming: false, optionCards: null, chips: null, isMap: true
        }]);
      }, 400);
      return;
    }

    // ── 1d. Personalization / custom‑blend intent → route to Personalized Lab ─
    const lower = trimmed.toLowerCase();
    const wantsPersonalize = [
      'personalize', 'personalise', 'customize', 'customise',
      'custom scent', 'custom fragrance', 'create my own scent',
      'create my own perfume', 'blend my own', 'mix my own scent',
    ].some(p => lower.includes(p));

    if (wantsPersonalize) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          text: "For fully personalized or custom‑blend creations, please use the **Personalized Lab** section in your dashboard. Maestro here focuses on analysing your preferences and recommending perfumes from the collection.",
          isStreaming: false,
          optionCards: null,
          chips: [
            { label: 'Open Personalized Lab', prompt: 'Open Personalized Lab' },
            { label: 'Help me choose a ready perfume', prompt: 'Help me find a perfume from the collection' },
          ],
        }]);
      }, 280);
      return;
    }

    // ── 2. Positive acceptance → start Q1 profiling locally ───────────────
    const findScentPhrases = [
      'find my perfect scent',
      'find my perfect perfume',
      'find perfume',
      'find a perfume',
      'find me a perfume',
      'need a perfume',
      'need perfume',
      'need a scent',
      'find my scent',
      'help me find a scent',
      'help me find a perfume',
      'recommend a perfume for me',
    ];

    const wantsFullProfile = profilingStep.current === null && (
      findScentPhrases.some(p => lower.includes(p)) ||
      (isPositiveResponse(trimmed) &&
        (lower.includes('find') || lower.includes('discover') ||
          lower.includes('scent') || lower.includes('perfect') ||
          lower === 'yes' || lower === 'sure' || lower === 'okay' || lower === 'ok'))
    );

    if (wantsFullProfile) {
      profilingStep.current = 0;
      const q = PROFILING_QUESTIONS[0];
      const id = Date.now() + 1;
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id, role: 'assistant',
          text: `Wonderful. I will ask you five quick questions to build your fragrance profile.\n\n**Question 1 — ${q.label}**\n${q.question}`,
          isStreaming: false, optionCards: q.options, chips: null,
        }]);
      }, 320);
      return;
    }

    // ── 3. Profiling flow: handle declines + strict option validation ─────
    if (profilingStep.current !== null && profilingStep.current < 5) {
      const step = profilingStep.current;
      const currentQ = PROFILING_QUESTIONS[step];

      // If the user says "no" or a decline phrase mid‑flow, stop profiling
      if (isDeclineResponse(trimmed) || lower === 'no') {
        profilingStep.current = null;
        profilingAnswers.current = {};
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            role: 'assistant',
            text: "No problem — we can skip the profile for now. You can ask about any specific perfume, a type of scent you like, or open the Personalized Lab for custom blends.",
            isStreaming: false,
            optionCards: null,
            chips: [
              { label: 'Ask about a perfume', prompt: 'Tell me about a specific perfume' },
              { label: 'Get a quick recommendation', prompt: 'Recommend a perfume for everyday use' },
              { label: 'Open Personalized Lab', prompt: 'Open Personalized Lab' },
            ],
          }]);
        }, 260);
        return;
      }

      // Only accept answers that match one of the defined options
      const normalized = trimmed.toLowerCase();
      const matchedOpt = currentQ.options.find(opt =>
        opt.label.toLowerCase() === normalized
      );

      if (!matchedOpt) {
        // Politely reject invalid input and re-show options
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            role: 'assistant',
            text: `Thanks for your reply, but for this step please choose **one** of the listed options for **${currentQ.label}** (you can tap a button or type it exactly).\n\nAvailable options:\n${currentQ.options.map(o => `- ${o.label}`).join('\n')}`,
            isStreaming: false,
            optionCards: currentQ.options,
            chips: null,
          }]);
        }, 260);
        return;
      }

      profilingAnswers.current[currentQ.id] = matchedOpt.label;
      profilingStep.current++;

      if (profilingStep.current < 5) {
        const nextQ = PROFILING_QUESTIONS[profilingStep.current];
        const id = Date.now() + 1;
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id, role: 'assistant',
            text: `Noted.\n\n**Question ${profilingStep.current + 1} — ${nextQ.label}**\n${nextQ.question}`,
            isStreaming: false, optionCards: nextQ.options, chips: null,
          }]);
        }, 280);
        return;
      }

      // All 5 done → API
      const a = profilingAnswers.current;
      const query = `Based on these user preferences, recommend the best matching perfume(s) from the database:
Mood: ${a.mood} | Occasion: ${a.occasion} | Longevity: ${a.longevity} | Strength: ${a.strength} | Style: ${a.style}
Summarize their profile warmly then give a curated recommendation.`;

      setIsLoading(true);
      try {
        const { answer, showNearbyMap } = await callAPI(query, [...currentMessages, userMsg]);
        profilingStep.current = null;
        setMessages(prev => [...prev, {
          id: Date.now() + 2, role: 'assistant', text: answer, 
          showNearbyMap, // ← ATTACH flag
          isStreaming: true,
          optionCards: null,
          chips: [
            { label: 'Find another scent', prompt: 'I would like to explore more fragrances' },
            { label: 'Accords & ratings', prompt: 'Tell me about its accords and ratings' },
            { label: 'Different mood', prompt: 'I want something for a different mood' },
          ],
        }]);
      } catch {
        setMessages(prev => [...prev, {
          id: Date.now() + 2, role: 'assistant', isStreaming: false, optionCards: null, chips: null,
          text: 'I was unable to retrieve a recommendation at this moment. Please try again shortly.',
        }]);
      } finally { setIsLoading(false); }
      return;
    }

    // ── 4. All other messages → direct API (including first msg like "I want fresh woody") ──
    setIsLoading(true);
    try {
      const { answer, showNearbyMap } = await callAPI(trimmed, [...currentMessages, userMsg]);
      const wantsScent = answer.toLowerCase().includes('signature scent') || answer.toLowerCase().includes('five question');
      const chips = isFirstMsg ? POST_FIRST_CHIPS
        : wantsScent ? [
          { label: 'Yes, find my scent', prompt: 'Yes, help me find my perfect scent' },
          { label: 'Ask about a perfume', prompt: 'Tell me about a specific perfume' },
        ]
          : detectAnswerChips(answer);

      // Always offer nearby shops as an option if asking for specific perfumes
      if (!isFirstMsg && !wantsScent && !chips.find(c => c.label === 'Find Nearby Shops')) {
        chips.push({ label: 'Find Nearby Shops', prompt: 'Find Nearby Perfume Shops' });
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant', text: answer, 
        showNearbyMap, // ← ATTACH flag
        isStreaming: true,
        optionCards: null, chips: chips.length > 0 ? chips : null,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant', isStreaming: false, optionCards: null, chips: null,
        text: 'I encountered an issue. Please try again in a moment.',
      }]);
    } finally { setIsLoading(false); }
  };

  const handleSend = () => {
    const val = input.trim();
    setInput('');
    sendMessage(val);
  };

  // Resolve userId for ChatHistoryDrawer
  let resolvedUserId = user?.id;
  if (!resolvedUserId) {
    try {
      const stored = localStorage.getItem('fragrance_user');
      if (stored) resolvedUserId = JSON.parse(stored).id;
    } catch { /* ignore */ }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Full-page intro overlay ── */}
      <AnimatePresence>
        {showIntro && (
          <IntroSplash onDone={() => { setShowIntro(false); handleIntroDone(); }} />
        )}
      </AnimatePresence>

      <ChatHistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectSession={handleSelectSession}
        userId={resolvedUserId}
        currentSessionId={sessionId}
      />

      {/*
        LAYOUT:
        - Outer div is h-full flex flex-col (fills whatever Card gives it)
        - Messages div: flex-1 overflow-y-auto with inner justify-end wrapper
        - Input: flex-shrink-0, never scrolls away
      */}
      <div
        className="flex flex-col h-full rounded-2xl overflow-hidden overflow-x-hidden"
        style={{
          background: 'linear-gradient(160deg, #0d1526 0%, #080f1a 100%)',
          border: '1px solid rgba(251,191,36,0.10)',
        }}
      >
        {/* Header (Minimal - Logo/Name/History) */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-3">
            <MaestroAvatar size={36} />
            <div>
              <p className="text-sm font-semibold text-white tracking-wide">Maestro</p>
              <p className="text-xs text-slate-400">Fragrance Expert</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowHistory(true)}
            className="ml-auto px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all flex items-center gap-2 border border-white/10 shadow-sm backdrop-blur-md"
          >
            <History className="w-3.5 h-3.5 text-amber-500/80" />
            History
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">

        {/* Messages — scrollable, content grows from bottom up */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto"
          style={{ minHeight: 0, scrollbarWidth: 'thin', scrollbarColor: 'rgba(251,191,36,0.1) transparent' }}
        >
          <div className="min-h-full flex flex-col justify-end px-5 pt-12 pb-3">
            {!messages.some(m => m.role === 'user') && (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center w-full">
                {/* Banner Logo — compact focus */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "tween", ease: "easeOut", duration: 0.5 }}
                  className="w-full max-w-[200px] mb-5 flex justify-center"
                >
                  <img src={SplashLogo} alt="Maestro" className="w-full h-full object-contain" />
                </motion.div>
                
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "tween", ease: "easeOut", duration: 0.5, delay: 0.1 }}
                  className="text-2xl font-bold text-white mb-2 tracking-tight"
                >
                  Chat with Maestro
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "tween", ease: "easeOut", duration: 0.5, delay: 0.2 }}
                  className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed"
                >
                  Your personal fragrance expert — discover, customize, and find your signature scent.
                </motion.p>
              </div>
            )}
            <div className="flex flex-col gap-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isBot = msg.role === 'assistant';
                  const timeStr = new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
                      className={`flex gap-3 mb-4 ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 mt-6">
                        {isBot ? <MaestroAvatar size={34} /> : <UserAvatar user={user} size={34} />}
                      </div>

                      {/* Bubble Container */}
                      <div className={`flex flex-col gap-1.5 w-full ${isBot ? 'items-start' : 'items-end'}`} style={{ maxWidth: '72%' }}>
                        {/* Name and Time Label */}
                        <div className={`flex gap-2 items-center px-1 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            {isBot ? 'Maestro' : 'You'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            {timeStr}
                          </span>
                        </div>

                        {/* The Actual Bubble */}
                        <div
                          className={`px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all duration-300 ${
                            isBot
                              ? 'bg-[#1a1c22] text-white/90 border border-white/5 rounded-[4px_18px_18px_18px]'
                              : 'bg-[#4b4532] text-white font-medium rounded-[18px_4px_18px_18px]'
                          } ${ (msg.isMap || msg.showNearbyMap) ? 'w-full' : 'w-fit'}`}
                          style={{ wordBreak: 'break-word' }}
                        >
                          {isBot
                            ? (msg.isMap || msg.showNearbyMap) ? (
                                <div className="flex flex-col w-full">
                                  <FormattedText text={msg.text} />
                                  <div className="mt-2 w-full">
                                    <NearbyShopsMap />
                                  </div>
                                </div>
                              ) : <FormattedText text={msg.text} />
                            : <p className="whitespace-pre-wrap">{msg.text}</p>
                          }
                        </div>
                        
                        {/* Floating options & suggestions below bubble */}
                        {isBot && msg.optionCards && !msg.isStreaming && (
                          <OptionPills 
                            options={msg.optionCards} 
                            onSelect={label => sendMessage(label)} 
                          />
                        )}

                        {isBot && msg.chips && (
                          <SuggestionChips 
                            suggestions={msg.chips} 
                            onSelect={prompt => {
                              setInput(prompt);
                              inputRef.current?.focus();
                            }} 
                          />
                        )}

                        {!msg.isStreaming && <CopyButton text={msg.text} />}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence>
                {isLoading && <TypingDots />}
              </AnimatePresence>

              <div ref={endRef} />
            </div>
          </div>
        </div>
      </div>

        {/* Input bar — FIXED at bottom */}
        <div
          className="flex-shrink-0 border-t border-white/5 px-4 py-3 relative z-10"
          style={{ background: 'rgba(8,15,26,1)', backdropFilter: 'none' }}
        >
          <div
            className="flex items-center gap-2 rounded-[16px] px-4 py-2.5 transition-all duration-300 shadow-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocusCapture={e => {
              e.currentTarget.style.border = '1px solid rgba(251,191,36,0.3)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.06)';
            }}
            onBlurCapture={e => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                  e.target.style.height = 'auto';
                }
              }}
              placeholder={chatReady ? 'Type your query here ...' : ''}
              disabled={!chatReady || isLoading}
              className="flex-1 bg-transparent text-sm outline-none py-2 resize-none disabled:opacity-30 scrollbar-none"
              style={{ color: 'rgba(255,255,255,0.9)', caretColor: 'rgb(251,191,36)', minHeight: '36px' }}
            />
            <style>{`input::placeholder { color: rgba(255,255,255,0.2); }`}</style>
            <button tabIndex={-1}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(251,191,36,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!chatReady || isLoading || !input.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
              style={chatReady && input.trim() && !isLoading
                ? {
                  background: 'rgb(251,191,36)', color: '#0f172a',
                  boxShadow: '0 4px 14px rgba(251,191,36,0.35)'
                }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.15)', cursor: 'not-allowed' }
              }
              onMouseEnter={e => { if (chatReady && input.trim() && !isLoading) { e.currentTarget.style.background = 'rgb(253,211,77)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
              onMouseLeave={e => { if (chatReady && input.trim() && !isLoading) { e.currentTarget.style.background = 'rgb(251,191,36)'; e.currentTarget.style.transform = 'scale(1)'; } }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-center text-xs mt-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.1)' }}>
            Maestro · Your AI Fragrance Expert
          </p>
        </div>
      </div>
    </>
  );
};

export default MaestroChatWindow;