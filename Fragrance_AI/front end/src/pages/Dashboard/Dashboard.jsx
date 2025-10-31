import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (token && email) {
      // Store token in both keys used across app
      localStorage.setItem('fragrance_token', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('fragrance_user', JSON.stringify({ email }));

      // Clean up URL
      window.history.replaceState({}, document.title, '/dashboard');
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem('fragrance_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fragrance_token');
    localStorage.removeItem('fragrance_user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <h2>Access Denied</h2>
        <p>Please log in to access your dashboard.</p>
        <button onClick={() => window.location.href = '/'} className="login-button">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="fragrance-logo">🌸</div>
          <span className="fragrance-brand">Fragrance AI</span>
        </div>
        <div className="dashboard-user">
          <span>Welcome, {user.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <h1>Welcome to Your Fragrance Dashboard!</h1>
          <p>Discover your perfect scent and explore our AI-powered recommendations.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>🎯 Personalized Recommendations</h3>
            <p>Get AI-powered fragrance suggestions based on your preferences.</p>
            <button className="card-button">Explore Now</button>
          </div>

          <div className="dashboard-card">
            <h3>🌸 My Collection</h3>
            <p>Manage your fragrance collection and track your favorites.</p>
            <button className="card-button">View Collection</button>
          </div>

          <div className="dashboard-card">
            <h3>🔬 Personalization Lab</h3>
            <p>Fine-tune your preferences and discover new scent profiles.</p>
            <button className="card-button">Start Lab</button>
          </div>

          <div className="dashboard-card">
            <h3>📊 Scent History</h3>
            <p>Track your fragrance journey and mood patterns.</p>
            <button className="card-button">View History</button>
          </div>
        </div>

        <div className="dashboard-quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button primary">
              Find My Perfect Scent
            </button>
            <button className="action-button secondary">
              Browse Trending
            </button>
            <button className="action-button secondary">
              Create Custom Blend
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

