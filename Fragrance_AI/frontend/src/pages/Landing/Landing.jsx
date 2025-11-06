// Landing.jsx – FragranceAI premium landing (spec-compliant)
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import MasonryGallery from '../../components/sections/MasonryGallery';
import QuoteSection from '../../components/sections/QuoteSection';
import FeaturesSection from '../../components/sections/FeaturesSection';
import CTASection from '../../components/sections/CTASection';
import LoginModal from '../../components/Login/LoginModal';
import SignupModal from '../../components/Login/SignupModal';
import './Landing.css';

// Async glob (Vite v5+) – gather up to 30 images
const imageImporters = import.meta.glob('../../assets/**/*.{jpg,jpeg,webp,png}');

const Landing = ({ onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Header scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load images via glob (sorted, capped to 30)
  useEffect(() => {
    const load = async () => {
      const entries = Object.entries(imageImporters).sort(([a], [b]) => a.localeCompare(b));
      const mods = await Promise.all(entries.slice(0, 60).map(([, imp]) => imp()));
      const urls = mods.map((m) => m?.default).filter(Boolean).slice(0, 30);
      setImages(urls);
    };
    load();
  }, []);

  // Hero slideshow
  useEffect(() => {
    if (images.length < 2) return; 
    const id = setInterval(() => setCurrentSlide((s) => (s + 1) % images.length), 4500);
    return () => clearInterval(id);
  }, [images.length]);

  const quotes = useMemo(() => ([
    'A fragrance is the invisible, unforgettable, ultimate accessory of fashion that heralds your arrival and prolongs your departure.',
    'Perfume is the art that makes memory speak.',
    "A woman's perfume tells more about her than her handwriting.",
    'The right fragrance can make you feel a little more stylish, but it should never eclipse who you are.',
    'Scent is the strongest tie to memory.',
    "Perfume is like a personal signature ... it connects me to the moment.",
    'A perfume is more than an extract—it is a presence in abstraction. A mystique.',
    'I only want to smell two kinds of perfume on a woman: mine and hers.'
  ]), []);

  // Check for valid token on mount and redirect to dashboard if valid
  useEffect(() => {
    const checkTokenAndHandleRedirect = async () => {
      const token = localStorage.getItem('fragrance_token') || localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Verify token with backend
          const res = await fetch('http://localhost:5000/api/auth/verifyToken', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await res.json();
          
          if (data.success && data.user) {
            // Token is valid - redirect to dashboard
            localStorage.setItem('fragrance_user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
            return;
          } else {
            // Token is invalid or expired - clear it
            localStorage.removeItem('fragrance_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('fragrance_user');
          }
        } catch (err) {
          console.error('Token verification error:', err);
          // If verification fails, clear tokens
          localStorage.removeItem('fragrance_token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('fragrance_user');
        }
      }

      // Check URL parameters on mount to handle OAuth redirects
      const urlParams = new URLSearchParams(window.location.search);
      const showLogin = urlParams.get('showLogin');
      const message = urlParams.get('message');
      
      if (showLogin === 'true') {
        setShowLoginModal(true);
        setShowSignupModal(false);
        
        // Show toast message if provided
        if (message) {
          // Decode the message
          const decodedMessage = decodeURIComponent(message);
          // Store in sessionStorage to be picked up by LoginModal
          sessionStorage.setItem('authMessage', decodedMessage);
        }
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkTokenAndHandleRedirect();
  }, []);

  const openLogin = () => { setShowLoginModal(true); setShowSignupModal(false); };
  const openSignup = () => { setShowSignupModal(true); setShowLoginModal(false); };
  const closeModals = () => { setShowLoginModal(false); setShowSignupModal(false); };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className={`fa-header ${isScrolled ? 'scrolled' : ''}`}> 
        <div className="fa-header__inner">
          <div className="fa-logo">FragranceAI</div>
          <nav className="fa-nav">
            <a href="#home" className="fa-nav__link">Home</a>
            <a href="#gallery" className="fa-nav__link">Discover</a>
            <a href="#features" className="fa-nav__link">Features</a>
            <a href="#contact" className="fa-nav__link">Contact</a>
          </nav>
          <div className="fa-actions">
            <button className="btn btn--outline" onClick={openLogin}>Login</button>
            <button className="btn btn--filled" onClick={openSignup}>Sign Up</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="fa-hero" id="home">
        <div className="fa-hero__bg">
          {images.slice(0, 5).map((src, i) => (
            <div
              key={i}
              className={`fa-hero__slide ${currentSlide === i ? 'is-active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          <div className="fa-hero__mesh" />
        </div>
        <div className="fa-hero__content">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="fa-hero__title">
            Discover Your Signature Scent
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8 }} className="fa-hero__subtitle">
            AI-Powered Fragrance Recommendations
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="fa-hero__ctas">
            <button className="btn btn--filled btn--lg" onClick={openSignup}>Get Started →</button>
            <a href="#gallery" className="btn btn--ghost btn--lg">Explore Gallery</a>
          </motion.div>
          <div className="fa-hero__scroll">Scroll ↓</div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <div id="gallery">
        <MasonryGallery images={images} />
      </div>

      {/* Quote Section */}
      <QuoteSection quote={quotes[0]} author="Coco Chanel" />

      {/* Features */}
      <div id="features">
        <FeaturesSection />
      </div>

      {/* CTA */}
      <CTASection onPrimary={openSignup} />

      {/* Footer */}
      <footer className="fa-footer" id="contact">
        <div className="fa-footer__inner">
          <div className="fa-footer__brand">FragranceAI</div>
          <div className="fa-footer__links">
            <a href="#" className="fa-footer__link">Privacy</a>
            <a href="#" className="fa-footer__link">Terms</a>
            <a href="#" className="fa-footer__link">Contact</a>
          </div>
          <div className="fa-footer__copy">© 2024 FragranceAI. All rights reserved.</div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onClose={closeModals} onLogin={onLogin} onSwitchToSignup={openSignup} />
      <SignupModal isOpen={showSignupModal} onClose={closeModals} onSignup={onLogin} onSwitchToLogin={openLogin} />
    </div>
  );
};

export default Landing;