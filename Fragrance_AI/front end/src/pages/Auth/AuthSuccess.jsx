import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token keys used across the app
      localStorage.setItem('fragrance_token', token);
      localStorage.setItem('authToken', token);
      // Verify the token with the backend and then redirect to dashboard
      verifyToken(token);
    } else {
      // No token found, redirect to login
      navigate('/');
    }
  }, [searchParams, navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Store user data
        localStorage.setItem('fragrance_user', JSON.stringify(data.user));
        // Redirect to dashboard immediately
        navigate('/dashboard');
      } else {
        // Invalid token, redirect to login
        localStorage.removeItem('fragrance_token');
        localStorage.removeItem('authToken');
        navigate('/');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('fragrance_token');
      localStorage.removeItem('authToken');
      navigate('/');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #3b82f6',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Authentication Successful!</h2>
        <p>Redirecting you to Fragrance AI...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
      <h2>Welcome to Fragrance AI!</h2>
      <p>You have been successfully authenticated.</p>
    </div>
  );
};

export default AuthSuccess;
