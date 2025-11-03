import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Preferences from './pages/Preferences/Preferences';
import PersonalizationLab from './pages/PersonalizationLab/PersonalizationLab';
import Recommendations from './pages/Recommendations/Recommendations';
import Collections from './pages/Collections/Collections';
import Gallery from './pages/Gallery/Gallery';
import Settings from './pages/Settings/Settings';
import Feedback from './pages/Feedback/Feedback';
import SearchBar from './components/Common/SearchBar';
import NotificationBell from './components/Common/NotificationBell';
import UserMenu from './components/Common/UserMenu';
import { useApp } from './context/AppContext';
import AuthSuccess from './pages/Auth/AuthSuccess';
import AuthError from './pages/Auth/AuthError';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';


function AppContent() {
  const { state, dispatch } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('fragrance_token') || localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    dispatch({ type: 'LOGOUT' });
  };

  const renderPage = () => {
    switch (state.currentPage) {
      case 'home': return <Home />;
      case 'preferences': return <Preferences />;
      case 'lab': return <PersonalizationLab />;
      case 'recommendations': return <Recommendations />;
      case 'collections': return <Collections />;
      case 'gallery': return <Gallery />;
      case 'settings': return <Settings />;
      case 'feedback': return <Feedback />;
      default: return <Home />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Landing onLogin={handleLogin} />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={
        (isAuthenticated || localStorage.getItem('fragrance_token') || localStorage.getItem('authToken')) ? <Dashboard /> : <Navigate to="/" replace />
      } />
      <Route path="/app/*" element={
        isAuthenticated ? (
          <div className="flex min-h-screen w-full overflow-hidden">
            {/* Sidebar */}
            <Sidebar onToggle={setSidebarCollapsed} />
            
            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col w-full min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-0 lg:ml-80'}`}>
              {/* Header */}
              <header className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-lg border-b border-gray-300/20 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 w-full sm:max-w-md">
                    <SearchBar />
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <NotificationBell />
                  <UserMenu onLogout={handleLogout} />
                </div>
              </header>
              
              {/* Main Content */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto w-full">
                <div className="w-full max-w-7xl mx-auto">
                  {renderPage()}
                </div>
              </main>
            </div>
          </div>
        ) : <Navigate to="/" replace />
      } />
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