import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get token from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        let token = urlParams.get('token') || localStorage.getItem('fragrance_token') || localStorage.getItem('authToken');
        const email = urlParams.get('email');

        if (token && email) {
          // Store token in both keys used across app
          localStorage.setItem('fragrance_token', token);
          localStorage.setItem('authToken', token);
          localStorage.setItem('fragrance_user', JSON.stringify({ email }));

          // Clean up URL
          window.history.replaceState({}, document.title, '/dashboard');
        }

        // Verify token with backend if we have one
        if (token) {
          const res = await fetch('http://localhost:5000/api/auth/verifyToken', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await res.json();
          
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('fragrance_user', JSON.stringify(data.user));
          } else {
            // Invalid token - clear and redirect
            localStorage.removeItem('fragrance_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('fragrance_user');
            setError('Session expired. Please login again.');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
        } else {
          // No token - check localStorage for user data
          const storedUser = localStorage.getItem('fragrance_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // If user exists but no token, still show but warn
            setUser(parsedUser);
          } else {
            setError('Please login to access your dashboard.');
          }
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setError('Unable to verify session. Please login again.');
        localStorage.removeItem('fragrance_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('fragrance_user');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
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

  if (error || (!user && !loading)) {
    return (
      <div className="dashboard-error">
        <h2>Access Denied</h2>
        <p>{error || 'Please log in to access your dashboard.'}</p>
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

