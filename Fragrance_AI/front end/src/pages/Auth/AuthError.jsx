import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('Authentication failed');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      padding: '20px'
    }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
      <h2>Authentication Failed</h2>
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        {errorMessage}
      </p>
      <button
        onClick={handleRetry}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Try Again
      </button>
    </div>
  );
};

export default AuthError;
