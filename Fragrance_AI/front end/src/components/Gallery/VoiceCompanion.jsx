import React, { useState, useEffect } from 'react';

const VoiceCompanion = () => {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickQuestions = [
    "What's good for date night?",
    "Recommend fresh scents for summer",
    "Make this blend warmer",
    "What matches my current mood?",
    "Show me popular evening fragrances"
  ];

  useEffect(() => {
    // Initial AI greeting
    setConversation([{
      id: 1,
      speaker: 'ai',
      message: "Hello! I'm your fragrance assistant. How can I help you discover scents today?",
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      // Simulate AI response
      setIsSpeaking(true);
      setTimeout(() => {
        const responses = [
          "Based on your preferences, I recommend trying citrus and aquatic notes for a fresh summer scent.",
          "For date night, consider warm vanilla or sensual rose notes with a hint of musk.",
          "Your current blend would benefit from adding amber or sandalwood for depth.",
          "I'm detecting you might enjoy fragrances similar to Bleu de Chanel or Acqua di Gio."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setConversation(prev => [...prev, {
          id: prev.length + 1,
          speaker: 'ai',
          message: randomResponse,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setIsSpeaking(false);
      }, 2000);
    } else {
      setIsListening(true);
      setConversation(prev => [...prev, {
        id: prev.length + 1,
        speaker: 'user',
        message: "[Listening...]",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const handleQuickQuestion = (question) => {
    setConversation(prev => [...prev, {
      id: prev.length + 1,
      speaker: 'user',
      message: question,
      timestamp: new Date().toLocaleTimeString()
    }]);

    setIsSpeaking(true);
    setTimeout(() => {
      const responses = {
        "What's good for date night?": "For date night, I recommend warm, sensual scents like vanilla, amber, or rose with musk. These create an intimate atmosphere.",
        "Recommend fresh scents for summer": "Perfect for summer: citrus notes like bergamot and lemon, aquatic accords, and light florals like jasmine or lily.",
        "Make this blend warmer": "To warm up your blend, add base notes like vanilla, amber, or sandalwood. These provide depth and longevity.",
        "What matches my current mood?": "Based on your energetic mood, fresh citrus and green notes would complement your vibe perfectly today.",
        "Show me popular evening fragrances": "Popular evening choices include woody-oriental blends, oud-based scents, and rich florals like tuberose or jasmine."
      };

      setConversation(prev => [...prev, {
        id: prev.length + 1,
        speaker: 'ai',
        message: responses[question] || "I'd be happy to help with that! Let me analyze your preferences...",
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsSpeaking(false);
    }, 1500);
  };

  return (
    <div className="glass-panel h-full">
      <h3 className="text-xl font-montserrat font-semibold mb-2">🗣️ AI Voice Companion</h3>
      <p className="text-accent-silver mb-6">Your personal fragrance assistant</p>
      
      <div className="space-y-4">
        {/* Conversation */}
        <div className="h-32 overflow-y-auto space-y-2 p-3 bg-white/5 rounded-lg border border-accent-silver/20">
          {conversation.map((msg) => (
            <div key={msg.id} className={`flex ${msg.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs p-2 rounded-lg text-sm ${
                msg.speaker === 'ai' 
                  ? 'bg-accent-cyan/10 border border-accent-cyan rounded-bl-none' 
                  : 'bg-accent-gold/10 border border-accent-gold rounded-br-none'
              }`}>
                <p>{msg.message}</p>
                <p className="text-xs text-accent-silver mt-1">{msg.timestamp}</p>
              </div>
            </div>
          ))}
          
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="bg-accent-cyan/10 border border-accent-cyan rounded-lg rounded-bl-none p-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Control */}
        <div className="text-center">
          <button 
            onClick={handleVoiceToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gradient-to-r from-accent-cyan to-accent-gold text-primary-dark hover:scale-110'
            }`}
          >
            {isListening ? '🛑' : '🎤'}
          </button>
          <p className="text-sm text-accent-silver mt-2">
            {isListening ? 'Listening... Speak now' : 'Tap to speak'}
          </p>
        </div>

        {/* Quick Questions */}
        <div>
          <h4 className="font-semibold text-sm text-accent-silver mb-2">Quick Questions:</h4>
          <div className="space-y-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                disabled={isSpeaking}
                className="w-full text-left p-2 bg-white/5 border border-accent-silver/20 rounded-lg text-sm hover:bg-accent-cyan/10 hover:border-accent-cyan transition-all duration-300 disabled:opacity-50"
              >
                "{question}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCompanion;