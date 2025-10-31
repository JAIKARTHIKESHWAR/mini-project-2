import React, { useState, useEffect } from 'react';

const AIFeedback = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const aiSuggestions = [
    "Your blend has a great balance! Consider adding a touch of vanilla for warmth.",
    "The citrus notes are prominent. They'll be perfect for daytime wear.",
    "This combination creates a sophisticated evening scent. Well done!",
    "The floral and woody notes complement each other beautifully.",
    "For better longevity, consider increasing the base notes intensity.",
    "This blend reminds me of popular luxury fragrances like Dior Sauvage."
  ];

  useEffect(() => {
    // Simulate AI analysis
    setIsTyping(true);
    const timer = setTimeout(() => {
      const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      setMessages([{
        id: 1,
        text: randomSuggestion,
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      }]);
      setIsTyping(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getNewSuggestion = () => {
    setIsTyping(true);
    setTimeout(() => {
      const usedMessages = messages.map(m => m.text);
      const availableSuggestions = aiSuggestions.filter(s => !usedMessages.includes(s));
      const newSuggestion = availableSuggestions.length > 0 
        ? availableSuggestions[Math.floor(Math.random() * availableSuggestions.length)]
        : aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: newSuggestion,
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="glass-panel">
      <h3 className="text-2xl font-montserrat font-semibold mb-2">💡 AI Fragrance Assistant</h3>
      <p className="text-accent-silver mb-6">Get intelligent feedback on your custom scent creations</p>
      
      <div className="space-y-4">
        {/* Chat Messages */}
        <div className="h-48 overflow-y-auto space-y-3 p-4 bg-white/5 rounded-xl border border-accent-silver/20">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                message.isAI 
                  ? 'bg-accent-cyan/10 border border-accent-cyan rounded-bl-none' 
                  : 'bg-accent-gold/10 border border-accent-gold rounded-br-none'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs text-accent-silver mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-accent-cyan/10 border border-accent-cyan rounded-2xl rounded-bl-none p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={getNewSuggestion}
            disabled={isTyping}
            className="btn-secondary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get Suggestion
          </button>
          <button className="btn-primary text-sm py-2">
            Save Blend
          </button>
        </div>

        {/* Analysis Summary */}
        <div className="p-4 bg-accent-cyan/5 border border-accent-cyan rounded-xl">
          <h4 className="font-semibold text-accent-cyan mb-2 flex items-center gap-2">
            <span>📊</span>
            Blend Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-accent-silver">Season:</span>
              <span className="text-white ml-2">All-season</span>
            </div>
            <div>
              <span className="text-accent-silver">Occasion:</span>
              <span className="text-white ml-2">Versatile</span>
            </div>
            <div>
              <span className="text-accent-silver">Longevity:</span>
              <span className="text-white ml-2">6-8 hours</span>
            </div>
            <div>
              <span className="text-accent-silver">Projection:</span>
              <span className="text-white ml-2">Moderate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeedback;