import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import RecentRecommendations from './RecentRecommendations';

const WelcomeModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md text-white">
      <h3 className="text-xl font-semibold mb-2">Welcome to Fragrance AI</h3>
      <p className="text-gray-300 mb-4">Let’s get you started with your personalized dashboard.</p>
      <button onClick={onClose} className="btn-premium">Continue</button>
    </div>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [stats, setStats] = useState([]);

  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const urlParams = new URLSearchParams(location.search);
        let token = urlParams.get('token') || localStorage.getItem('fragrance_token') || localStorage.getItem('authToken');
        const email = urlParams.get('email');

        if (token && email) {
          localStorage.setItem('fragrance_token', token);
          localStorage.setItem('authToken', token);
          localStorage.setItem('fragrance_email', email);
          localStorage.setItem('fragrance_user', JSON.stringify({ email }));
          window.history.replaceState({}, document.title, '/dashboard');
        }

        if (token) {
          const res = await fetch(`${API_BASE}/api/auth/verifyToken`, {
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
            localStorage.removeItem('fragrance_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('fragrance_user');
            setError('Session expired. Please login again.');
            setTimeout(() => { window.location.href = '/'; }, 1500);
          }
        } else {
          const storedUser = localStorage.getItem('fragrance_user');
          if (storedUser) setUser(JSON.parse(storedUser));
          else setError('Please login to access your dashboard.');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setError('Unable to verify session. Please login again.');
        localStorage.removeItem('fragrance_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('fragrance_user');
        setTimeout(() => { window.location.href = '/'; }, 1500);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [location]);

  useEffect(() => {
    const firstLogin = localStorage.getItem('firstLogin');
    if (firstLogin === 'true') {
      setShowWelcome(true);
      localStorage.setItem('firstLogin', 'false');
    }
    setStats([
      { title: 'Total Scents', value: '1,247', icon: 'spa', trend: '+12%', color: 'from-purple-500 to-pink-500', description: 'Available fragrances' },
      { title: 'Favorites Saved', value: '23', icon: 'favorite', trend: '+5', color: 'from-rose-500 to-red-500', description: 'Your saved scents' },
      { title: 'Lab Created', value: '5', icon: 'science', trend: '+2', color: 'from-blue-500 to-cyan-500', description: 'Custom blends' },
      { title: 'Chats Today', value: '12', icon: 'chat', trend: '+3', color: 'from-emerald-500 to-teal-500', description: 'AI conversations' },
    ]);
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">Loading your dashboard...</div>
    );
  }

  if (error || (!user && !loading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p>{error || 'Please log in to access your dashboard.'}</p>
        <button onClick={() => (window.location.href = '/')} className="btn-premium">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      </AnimatePresence>

      <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-rose-300 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-gray-300 mt-2 text-lg">Welcome back, <span className="text-gold-400 font-semibold">{user?.username || 'User'}</span>! Ready to discover your perfect scent?</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">System Online</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} index={index} />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <motion.div className="xl:col-span-2" variants={itemVariants}>
            <RecentRecommendations />
          </motion.div>
          <motion.div variants={itemVariants}>
            <QuickActions />
          </motion.div>
        </div>

        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8" variants={itemVariants}>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Scent of the Day</h3>
              <span className="px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-sm font-medium">Featured</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <span className="material-icons text-white text-3xl">spa</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Dior Sauvage</h4>
                <p className="text-gray-400 text-sm">Fresh, aromatic, and utterly captivating</p>
                <div className="flex items-center mt-2">
                  <div className="flex text-gold-400">{'★'.repeat(5)}</div>
                  <span className="text-gray-500 text-sm ml-2">4.8 (12.5K)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Your Scent Profile</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Woody Preference</span><span className="text-gold-400">85%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-amber-500 to-gold-400 h-2 rounded-full" style={{ width: '85%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Fresh Scents</span><span className="text-gold-400">72%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-cyan-500 to-blue-400 h-2 rounded-full" style={{ width: '72%' }}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Oriental Notes</span><span className="text-gold-400">63%</span></div>
                <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-rose-500 to-pink-400 h-2 rounded-full" style={{ width: '63%' }}></div></div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

