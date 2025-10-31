import React, { useState } from 'react';

const TrendingCarousel = ({ fragrances }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === fragrances.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? fragrances.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative glass-panel p-4 sm:p-6 lg:p-8 mx-4">
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {fragrances.map((fragrance, index) => (
            <div key={fragrance.id} className="w-full flex-shrink-0">
              <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 p-4 lg:p-6">
                <div className="text-4xl sm:text-6xl lg:text-8xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-purple-500/20 flex items-center justify-center">
                  {fragrance.image}
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{fragrance.name}</h3>
                  <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-4">{fragrance.brand}</p>
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm sm:text-base lg:text-lg font-bold text-white shadow-xl">
                      {fragrance.match}%
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base">AI Match Score</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-4 lg:mb-6">
                    {fragrance.notes.map((note, idx) => (
                      <span key={idx} className="px-2 sm:px-3 py-1 bg-purple-500/10 border border-purple-500 rounded-full text-xs sm:text-sm text-purple-300">
                        {note}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                    <button className="btn-secondary text-sm sm:text-base">Learn More</button>
                    <button className="btn-primary text-sm sm:text-base">Buy {fragrance.price}</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-lg border border-purple-500/20 rounded-full flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500 transition-all duration-300"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-lg border border-purple-500/20 rounded-full flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500 transition-all duration-300"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
        </svg>
      </button>

      {/* Indicators */}
      <div className="flex justify-center mt-4 lg:mt-6 gap-2">
        {fragrances.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 w-6 sm:w-8' 
                : 'bg-gray-300/40 hover:bg-gray-300/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingCarousel;

