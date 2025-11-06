import React from 'react';
import { motion } from 'framer-motion';

const QuoteSection = ({ quote, author }) => {
  return (
    <section className="quote-section">
      <div className="quote-container">
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="quote-text"
        >
          “{quote}”
        </motion.blockquote>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="quote-author"
        >
          — {author}
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteSection;


