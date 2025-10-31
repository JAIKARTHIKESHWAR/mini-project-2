import React from 'react';
import { motion } from 'framer-motion';

const features = [
  { title: 'AI-Powered Analysis', detail: 'Advanced models analyze notes, accords, and your preferences to recommend matches.' },
  { title: 'Personal Profile', detail: 'Build a personalized scent profile that adapts to your mood and seasons.' },
  { title: 'Curated Selection', detail: 'Handpicked fragrances matched with your style for every occasion.' },
];

const FeaturesSection = () => {
  return (
    <section className="features-section">
      <div className="features-container">
        {features.map((f, idx) => (
          <motion.div
            key={f.title}
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon" aria-hidden="true" />
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-detail">{f.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;


