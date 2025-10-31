import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const QuickStart = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const { dispatch } = useApp();

  const questions = [
    {
      id: 'mood',
      question: "How are you feeling today?",
      options: ["Energetic 💪", "Calm 😌", "Romantic 💖", "Professional 👔", "Adventurous 🌍"]
    },
    {
      id: 'occasion',
      question: "What's the occasion?",
      options: ["Work 💼", "Date Night 💑", "Gym 🏋️", "Evening Out 🌃", "Everyday 🏠"]
    },
    {
      id: 'intensity',
      question: "Preferred scent intensity?",
      options: ["Soft & Subtle 🌬️", "Moderate 🌫️", "Strong & Lasting 💨"]
    },
    {
      id: 'weather',
      question: "Current weather preference?",
      options: ["Warm ☀️", "Cold ❄️", "Rainy 🌧️", "Any 🌈"]
    },
    {
      id: 'timeOfDay',
      question: "Time of day for wearing?",
      options: ["Morning 🌅", "Afternoon ☀️", "Evening 🌇", "Night 🌙"]
    }
  ];

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentStep].id]: answer };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All questions answered
      dispatch({ type: 'SET_PREFERENCES', payload: newAnswers });
      dispatch({ type: 'SET_CURRENT_PAGE', payload: 'recommendations' });
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="glass-panel mb-12 animate-pulse-glow">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-montserrat font-semibold mb-2">🎯 Find My Perfect Scent</h3>
        <p className="text-accent-silver">Answer 5 quick questions for personalized recommendations</p>
      </div>
      
      <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-accent-cyan to-accent-gold transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="mb-8">
        <h4 className="text-xl font-semibold text-center mb-6 bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent">
          {questions[currentStep].question}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions[currentStep].options.map((option, index) => (
            <button
              key={index}
              className="p-4 bg-white/5 border border-accent-silver/20 rounded-xl text-white cursor-pointer transition-all duration-300 hover:bg-accent-cyan/10 hover:border-accent-cyan hover:transform hover:scale-105 hover:shadow-lg hover:shadow-accent-cyan/20"
              onClick={() => handleAnswer(option)}
            >
              <span className="text-lg">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center text-accent-silver">
        <button 
          className="hover:text-white transition-colors hover:underline"
          onClick={() => setCurrentStep(0)}
        >
          Start Over
        </button>
        <span className="text-sm">
          {currentStep + 1} of {questions.length}
        </span>
      </div>
    </div>
  );
};

export default QuickStart;