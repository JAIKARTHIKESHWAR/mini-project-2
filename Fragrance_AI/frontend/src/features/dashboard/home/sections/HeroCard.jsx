import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

import perfume1 from "../../../../assets/perfume-hero-1.jpg";
import perfume2 from "../../../../assets/perfume-hero-2.jpg";
import perfume3 from "../../../../assets/perfume-hero-3.jpg";
import perfume4 from "../../../../assets/perfume-hero-4.jpg";
import perfume5 from "../../../../assets/perfume-hero-5.jpg";

const perfumes = [
  { image: perfume1, name: "Amber Mystique", price: "$189", notes: "Amber • Vanilla • Sandalwood" },
  { image: perfume2, name: "Rose & Oud", price: "$245", notes: "Rose • Oud • Musk" },
  { image: perfume3, name: "Jasmine Dreams", price: "$165", notes: "Jasmine • White Tea • Bergamot" },
  { image: perfume4, name: "Vanilla Sandalwood", price: "$210", notes: "Vanilla • Sandalwood • Cedar" },
  { image: perfume5, name: "Citrus Bergamot", price: "$155", notes: "Bergamot • Lemon • Green Tea" },
];

export default function HeroCard() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % perfumes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % perfumes.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + perfumes.length) % perfumes.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onClick={() => navigate("/dashboard")}
      className="glass-card-hover relative h-full overflow-hidden group cursor-pointer"
    >
      {/* Decorative line art background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
          <circle cx="350" cy="50" r="80" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          <circle cx="50" cy="250" r="60" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          <path d="M0 150 Q200 100 400 150" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
        </svg>
      </div>

      {/* Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={perfumes[currentIndex].image}
            alt={perfumes[currentIndex].name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content overlay */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium tracking-wider uppercase text-primary">
            Trending Today
          </span>
        </div>

        {/* Perfume info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-semibold text-foreground">
              {perfumes[currentIndex].name}
            </h2>
            <p className="text-sm text-muted-foreground tracking-wide">
              {perfumes[currentIndex].notes}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-primary">
                {perfumes[currentIndex].price}
              </span>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {perfumes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-primary"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>

          {/* Arrow controls */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
