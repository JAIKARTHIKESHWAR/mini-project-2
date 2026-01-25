import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Landing from './pages/Landing/Landing';
import AppShell from './components/layout/AppShell';
import HomePage from './features/dashboard/home/HomePage';
import MaestroPage from './features/dashboard/maestro/MaestroPage';
import PersonalizationLabPage from './features/dashboard/personalization/PersonalizationLabPage';
import ShoppingPage from './features/dashboard/shopping/ShoppingPage';
import AuthSuccess from './pages/Auth/AuthSuccess';
import AuthError from './pages/Auth/AuthError';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

function AppContent() {
  const { dispatch } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const location = useLocation();

  useEffect(() => {
    const verifyTokenOnStartup = async () => {
      const token =
        localStorage.getItem('fragrance_token') ||
        localStorage.getItem('authToken');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/verifyToken', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (data.success && data.user) {
          console.log('✅ Token verified:', data.user);
          setIsAuthenticated(true);
          dispatch({ type: 'SET_USER', payload: data.user });
          localStorage.setItem('fragrance_user', JSON.stringify(data.user));
        } else {
          localStorage.clear();
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.clear();
        setIsAuthenticated(false);
      }
    };

    verifyTokenOnStartup();
  }, [dispatch]);

  if (isAuthenticated === null) {
    // Don’t redirect until we know for sure
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Checking authentication...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="maestro" element={<MaestroPage />} />
        <Route path="personalization-lab" element={<PersonalizationLabPage />} />
        <Route path="shopping" element={<ShoppingPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}
export default App;

