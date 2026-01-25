import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";

const quotes = [
  { text: "A woman's perfume tells more about her than her handwriting.", author: "Christian Dior" },
  { text: "Perfume is the key to our memories.", author: "Kate Lord Brown" },
  { text: "No elegance is possible without perfume.", author: "Coco Chanel" },
  { text: "Where should one use perfume? Wherever one wants to be kissed.", author: "Coco Chanel" },
  { text: "Perfume follows you; it chases you and lingers behind you.", author: "Sonia Rykiel" },
  { text: "A good fragrance is really a powerful cocktail of memories.", author: "Jeffrey Stepakoff" },
  { text: "Perfume puts the finishing touch to elegance.", author: "Yves Saint Laurent" },
];

export default function QuotesCard() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    // Rotate quotes every 8 seconds
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card h-full p-5 flex flex-col relative overflow-hidden"
    >
      {/* Decorative quote icon */}
      <div className="absolute top-4 right-4 opacity-10">
        <Quote className="w-16 h-16 text-primary" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Quote className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          Daily Inspiration
        </span>
      </div>

      {/* Quote content */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <p className="text-lg font-display italic text-foreground leading-relaxed">
              "{quotes[currentQuote].text}"
            </p>
            <p className="text-sm text-primary font-medium">
              — {quotes[currentQuote].author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-4">
        {quotes.slice(0, 5).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-500 ${
              idx === currentQuote % 5
                ? "w-4 bg-primary"
                : "w-1 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
