import React from 'react';
import QuickStart from '../../components/Dashboard/QuickStart';
import TrendingCarousel from '../../components/Dashboard/TrendingCarousel';
import FragranceCard from '../../components/Dashboard/FragranceCard';
import { useApp } from '../../context/AppContext';

const Home = () => {
  const { state } = useApp();

  const trendingFragrances = [
    {
      id: 1,
      name: "Ocean Breeze",
      brand: "Aqua Di Selva",
      match: 95,
      notes: ["Citrus", "Marine", "Musk"],
      price: "$89",
      image: "🌊"
    },
    {
      id: 2,
      name: "Midnight Oud",
      brand: "Royal Arabian",
      match: 88,
      notes: ["Oud", "Rose", "Amber"],
      price: "$156",
      image: "🌙"
    },
    {
      id: 3,
      name: "Vanilla Sky",
      brand: "Cloud Perfumes",
      match: 92,
      notes: ["Vanilla", "Tonka", "Almond"],
      price: "$75",
      image: "☁️"
    }
  ];

  const personalizedFragrances = [
    {
      id: 4,
      name: "Citrus Splash",
      brand: "Fresh & Co",
      match: 96,
      notes: ["Lemon", "Bergamot", "Ginger"],
      price: "$68",
      image: "🍋"
    },
    {
      id: 5,
      name: "Woody Elegance",
      brand: "Forest Essence",
      match: 91,
      notes: ["Sandalwood", "Cedar", "Vetiver"],
      price: "$124",
      image: "🌲"
    },
    {
      id: 6,
      name: "Floral Dream",
      brand: "Bloom & Co",
      match: 89,
      notes: ["Rose", "Jasmine", "Lily"],
      price: "$98",
      image: "🌹"
    }
  ];

  return (
    <div className="w-full fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8 lg:mb-12 py-4 lg:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3 lg:mb-4 px-4">
          Welcome to Your Scent Journey
        </h1>
        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 max-w-2xl mx-auto px-4">
          Let AI help you discover fragrances that tell your story. Experience luxury scents tailored to your personality.
        </p>
      </div>

      {/* Quick Start Section */}
      <div className="mb-8 lg:mb-12">
        <QuickStart />
      </div>

      {/* Trending Section */}
      <section className="mb-8 lg:mb-16">
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 lg:mb-3 flex items-center gap-2 lg:gap-3 px-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Trending This Week
            </span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg px-4">Most loved by our fragrance community</p>
        </div>
        <TrendingCarousel fragrances={trendingFragrances} />
      </section>

      {/* Personalized Section */}
      <section className="mb-8 lg:mb-16">
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2 lg:mb-3 flex items-center gap-2 lg:gap-3 px-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Personalized For You
            </span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg px-4">Based on your preferences and scent profile</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 px-4">
          {personalizedFragrances.map(fragrance => (
            <FragranceCard key={fragrance.id} fragrance={fragrance} />
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="glass-panel text-center mx-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">Ready to Explore More?</h3>
        <p className="text-gray-300 mb-4 lg:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
          Dive deeper into our fragrance collections or create your own custom scent in our Personalization Lab.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button className="btn-primary w-full sm:w-auto">Explore Collections</button>
          <button className="btn-secondary w-full sm:w-auto">Visit Lab</button>
        </div>
      </section>
    </div>
  );
};

export default Home;