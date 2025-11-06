import React from 'react';
import Masonry from 'react-masonry-css';

const MasonryGallery = ({ images = [] }) => {
  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1100: 3,
    768: 2,
    480: 2
  };

  return (
    <section className="masonry-section" id="explore">
      <div className="masonry-container">
        <h2 className="masonry-title">Discover Your Perfect Scent</h2>
        <p className="masonry-subtitle">Browse our curated collection of AI-recommended fragrances</p>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((src, idx) => (
            <div key={idx} className="fragrance-card">
              <div className="fragrance-image-container">
                <img src={src} alt={`Fragrance ${idx + 1}`} className="fragrance-image" loading="lazy" />
              </div>
            </div>
          ))}
        </Masonry>
      </div>
    </section>
  );
};

export default MasonryGallery;


