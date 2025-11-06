import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const statusParam = searchParams.get('status');
    const emailParam = searchParams.get('email');
    const messageParam = searchParams.get('message');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      // If token is in URL, verify it
      verifyToken(token);
    } else if (statusParam) {
      // Status from backend redirect
      handleStatus(statusParam, messageParam);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
    }
  }, [searchParams]);

  const verifyToken = async (token) => {
    try {
      // Backend will redirect, so we need to handle it differently
      // Instead of fetch, we'll redirect to backend and let it handle
      window.location.href = `http://localhost:5000/api/auth/verify/${token}`;
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Unable to verify email. Please try again.');
    }
  };

  const handleStatus = (statusParam, messageParam) => {
    switch (statusParam) {
      case 'success':
        setStatus('success');
        setMessage('✅ Your email has been verified successfully! You can now log in.');
        break;
      case 'already_verified':
        setStatus('success');
        setMessage('✅ This email is already verified. You can log in.');
        break;
      case 'error':
        setStatus('error');
        setMessage(messageParam ? decodeURIComponent(messageParam) : 'Verification failed.');
        break;
      default:
        setStatus('error');
        setMessage('Invalid verification status.');
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Email address is required to resend verification.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setStatus('pending');
        setMessage('✅ Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      setMessage('Unable to resend verification email. Please try again.');
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="verify-email-content">
          <div className="verify-email-icon">
            {status === 'success' && (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="none"/>
                <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {status === 'error' && (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="none"/>
                <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            {status === 'loading' && (
              <div className="verify-spinner"></div>
            )}
          </div>

          <h1 className="verify-email-title">
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'loading' && 'Verifying Email...'}
            {status === 'pending' && 'Check Your Email'}
          </h1>

          <p className="verify-email-message">{message || 'Processing...'}</p>

          {status === 'success' && (
            <div className="verify-email-actions">
              <button 
                className="verify-button verify-button-primary"
                onClick={() => navigate('/?showLogin=true')}
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="verify-email-actions">
              {message.includes('expired') && email && (
                <button 
                  className="verify-button verify-button-secondary"
                  onClick={handleResendVerification}
                >
                  Resend Verification Email
                </button>
              )}
              <button 
                className="verify-button verify-button-primary"
                onClick={() => navigate('/')}
              >
                Go to Home
              </button>
            </div>
          )}

          {status === 'pending' && email && (
            <div className="verify-email-actions">
              <button 
                className="verify-button verify-button-secondary"
                onClick={handleResendVerification}
              >
                Resend Email
              </button>
              <button 
                className="verify-button verify-button-primary"
                onClick={() => navigate('/?showLogin=true')}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

