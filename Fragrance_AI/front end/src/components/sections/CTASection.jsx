import React from 'react';
import { motion } from 'framer-motion';

const CTASection = ({ onPrimary }) => {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <motion.h2
          className="cta-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Ready to Find Your Perfect Scent?
        </motion.h2>
        <motion.button
          className="cta-button"
          onClick={onPrimary}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          Get Started →
        </motion.button>
      </div>
    </section>
  );
};

export default CTASection;


