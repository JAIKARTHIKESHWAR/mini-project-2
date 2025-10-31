import React, { useState } from 'react';

const Feedback = () => {
  const [feedback, setFeedback] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
    rating: 5,
    includeData: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { value: 'suggestion', label: '💡 Suggestion', description: 'Share ideas to improve Fragrance AI' },
    { value: 'bug', label: '🐛 Bug Report', description: 'Report technical issues or errors' },
    { value: 'feature', label: '🚀 Feature Request', description: 'Request new features or capabilities' },
    { value: 'general', label: '💬 General Feedback', description: 'Share your overall experience' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    setFeedback({
      type: 'suggestion',
      subject: '',
      message: '',
      rating: 5,
      includeData: true
    });
  };

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto fade-in text-center">
        <div className="glass-panel">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-accent-silver mb-8">
            Your feedback has been received. We appreciate you helping us improve Fragrance AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setSubmitted(false)}
              className="btn-secondary py-3"
            >
              Submit More Feedback
            </button>
            <button 
              onClick={() => window.history.back()}
              className="btn-primary py-3"
            >
              Return to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-montserrat font-bold bg-gradient-to-r from-accent-cyan to-accent-gold bg-clip-text text-transparent mb-4">
          💬 Feedback & Support
        </h1>
        <p className="text-xl text-accent-silver">
          We'd love to hear your thoughts and help you with any questions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback Form */}
        <div className="lg:col-span-2">
          <div className="glass-panel">
            <h2 className="text-2xl font-montserrat font-semibold mb-6">Share Your Feedback</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block font-medium text-white mb-3">Feedback Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFeedback(prev => ({ ...prev, type: type.value }))}
                      className={`p-3 border rounded-lg text-left transition-all duration-300 ${
                        feedback.type === type.value
                          ? 'border-accent-cyan bg-accent-cyan/10'
                          : 'border-accent-silver/20 bg-white/5 hover:border-accent-cyan/50'
                      }`}
                    >
                      <div className="font-medium text-white mb-1">{type.label.split(' ')[0]}</div>
                      <div className="text-xs text-accent-silver">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block font-medium text-white mb-3">
                  Overall Satisfaction
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        star <= feedback.rating ? 'text-yellow-400' : 'text-accent-silver/30'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-accent-silver mt-1">
                  <span>Not satisfied</span>
                  <span>Very satisfied</span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-medium text-white mb-2">Subject</label>
                <input
                  type="text"
                  value={feedback.subject}
                  onChange={(e) => setFeedback(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your feedback..."
                  className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver focus:border-accent-cyan focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-medium text-white mb-2">Detailed Message</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide as much detail as possible..."
                  rows="6"
                  className="w-full px-3 py-2 bg-white/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver focus:border-accent-cyan focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Data Sharing */}
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-accent-silver/20 rounded-lg">
                <input
                  type="checkbox"
                  id="includeData"
                  checked={feedback.includeData}
                  onChange={(e) => setFeedback(prev => ({ ...prev, includeData: e.target.checked }))}
                  className="w-4 h-4 text-accent-cyan bg-white/5 border-accent-silver/20 rounded focus:ring-accent-cyan focus:ring-2"
                />
                <label htmlFor="includeData" className="text-sm text-accent-silver">
                  Include anonymous usage data to help us better understand your feedback
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Support Resources */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <div className="glass-panel">
            <h3 className="text-xl font-montserrat font-semibold mb-4">🤖 AI Support Assistant</h3>
            <p className="text-accent-silver text-sm mb-4">
              Get instant help from our AI assistant
            </p>
            <button className="w-full btn-secondary py-2">
              Start Chat
            </button>
          </div>

          {/* Help Resources */}
          <div className="glass-panel">
            <h3 className="text-xl font-montserrat font-semibold mb-4">📚 Help Resources</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-white/5 border border-accent-silver/20 rounded-lg hover:border-accent-cyan transition-colors">
                <div className="font-medium text-white">FAQ & Guides</div>
                <div className="text-xs text-accent-silver">Common questions and solutions</div>
              </button>
              <button className="w-full text-left p-3 bg-white/5 border border-accent-silver/20 rounded-lg hover:border-accent-cyan transition-colors">
                <div className="font-medium text-white">Video Tutorials</div>
                <div className="text-xs text-accent-silver">Learn how to use features</div>
              </button>
              <button className="w-full text-left p-3 bg-white/5 border border-accent-silver/20 rounded-lg hover:border-accent-cyan transition-colors">
                <div className="font-medium text-white">Community Forum</div>
                <div className="text-xs text-accent-silver">Connect with other users</div>
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="glass-panel">
            <h3 className="text-xl font-montserrat font-semibold mb-4">📞 Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-accent-silver">Email:</span>
                <span className="text-white">support@fragranceai.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-silver">Response Time:</span>
                <span className="text-green-400">Within 24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent-silver">Status:</span>
                <span className="text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;