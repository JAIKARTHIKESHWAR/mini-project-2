import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';
import Toast from '../Common/Toast';

const LoginModal = ({ isOpen, onClose, onLogin, onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Check for auth messages from URL redirects
  useEffect(() => {
    if (isOpen) {
      const authMessage = sessionStorage.getItem('authMessage');
      if (authMessage) {
        setToastMessage(authMessage);
        setToastType(authMessage.includes('already exists') || authMessage.includes('failed') ? 'error' : 'success');
        setShowToast(true);
        sessionStorage.removeItem('authMessage');
      }
    }
  }, [isOpen]);

  // Reset fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setIsLoading(false);
      setError('');
      setEmailError('');
      setPasswordError('');
      setShowToast(false);
      setToastMessage('');
      setToastType('success');
      setShowResendVerification(false);
      setUnverifiedEmail('');
      setResendLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time email validation
  const validateEmail = (value) => {
    if (!value) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Real-time password validation
  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
    setError('');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validate before submitting
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        // Show specific error messages from backend
        if (res.status === 403 && data.requiresVerification) {
          // Email not verified
          setError('Please verify your email address before logging in.');
          setShowResendVerification(true);
          setUnverifiedEmail(data.email || email);
          setToastMessage('Please verify your email before logging in.');
          setToastType('error');
          setShowToast(true);
        } else if (res.status === 404 && data.message.includes('Account not found')) {
          setEmailError('Account not found. Please sign up first.');
          setToastMessage('Account not found. Please sign up first.');
          setToastType('error');
          setShowToast(true);
        } else if (res.status === 401 && data.message.includes('Incorrect password')) {
          setPasswordError('Incorrect password.');
          setToastMessage('Incorrect password.');
          setToastType('error');
          setShowToast(true);
        } else if (res.status === 400 && (data.message?.includes('created with') || data.message?.includes('Password login is not available'))) {
          // OAuth or missing password guidance from backend
          setError(data.message);
          setToastMessage(data.message);
          setToastType('error');
          setShowToast(true);
        } else if (res.status === 400 && data.message.includes('Invalid email format')) {
          setEmailError('Invalid email format');
          setToastMessage('Invalid email format');
          setToastType('error');
          setShowToast(true);
        } else {
          setError(data.message || 'Login failed');
          setToastMessage(data.message || 'Login failed');
          setToastType('error');
          setShowToast(true);
        }
      } else {
        // Success - cookies are set automatically by server
        // Store user data (not tokens) in localStorage for quick access
        if (data.user) {
          localStorage.setItem('fragrance_user', JSON.stringify(data.user));
        }
        
        // Call onLogin callback to update app state
        if (onLogin) {
          onLogin(data.user);
        }
        
        // Show toast and allow app state to update before redirect
        setToastMessage('Login successful! Redirecting...');
        setToastType('success');
        setShowToast(true);

        // Delay navigation slightly to let isAuthenticated/context update
        setTimeout(() => {
          try {
            navigate('/dashboard', { replace: true });
          } catch (navError) {
            // Fallback to window.location if navigate fails
            console.warn('Navigate failed, using window.location:', navError);
            window.location.href = '/dashboard';
          }
        }, 1000);
      }
    } catch (err) {
      setError('Unable to login. Please try again.');
      setToastMessage('Unable to login. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${API_BASE}/api/auth/google?source=login`;
  };

  const handleFacebookLogin = () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${API_BASE}/api/auth/facebook`;
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setResendLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setToastMessage('✅ Verification email sent! Please check your inbox.');
        setToastType('success');
        setShowToast(true);
        setShowResendVerification(false);
      } else {
        setToastMessage(data.message || 'Failed to resend verification email.');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('Unable to resend verification email. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Fragment>
      <Toast 
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="login-modal-overlay" onClick={onClose}>
        <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="login-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="login-modal-content">
            <div className="login-modal-header">
              <div className="login-modal-logo">
                <div className="login-logo-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    <path d="M19 15L20.09 19.26L24 20L20.09 20.74L19 24L17.91 20.74L14 20L17.91 19.26L19 15Z" fill="currentColor"/>
                    <path d="M5 15L6.09 19.26L10 20L6.09 20.74L5 24L3.91 20.74L0 20L3.91 19.26L5 15Z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="login-logo-text">Fragrance AI</span>
              </div>
              <h2 className="login-modal-title">Welcome to Fragrance AI</h2>
              <p className="login-modal-subtitle">Find your perfect scent</p>
            </div>

            <form className="login-modal-form" onSubmit={handleSubmit}>
              {error && (
                <div className="login-error" style={{ color: '#ef4444', marginBottom: '8px' }}>
                  {error}
                  {showResendVerification && unverifiedEmail && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1a73e8',
                          cursor: resendLoading ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        {resendLoading ? 'Sending...' : 'Resend verification email'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="login-form-group">
                <label className="login-form-label">Email</label>
                <input
                  type="email"
                  className={`login-form-input ${emailError ? 'login-input-error' : ''}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  required
                />
                {emailError && (
                  <div className="login-field-error">{emailError}</div>
                )}
              </div>

              <div className="login-form-group">
                <div className="login-label-container">
                  <label className="login-form-label">Password</label>
                  <button 
                    type="button" 
                    className="login-forgot-password"
                    onClick={() => window.location.href = '/forgot-password'}
                  >
                    Forgot your password?
                  </button>
                </div>
                <div className="login-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`login-form-input ${passwordError ? 'login-input-error' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => validatePassword(password)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <div className="login-field-error">{passwordError}</div>
                )}
              </div>

            <button 
              type="submit" 
              className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="login-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="login-social-buttons">
            <button className="login-social-btn login-google-btn" onClick={handleGoogleLogin}>
              <div className="login-social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              Continue with Google
            </button>

            <button className="login-social-btn login-facebook-btn" onClick={handleFacebookLogin}>
              <div className="login-social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              Continue with Facebook
            </button>
          </div>

          <div className="login-modal-footer">
            <div className="login-switch-auth">
              <span>Not on Fragrance AI yet? </span>
              <button className="login-switch-link" onClick={onSwitchToSignup}>
                Sign up
              </button>
            </div>
            
            <div className="login-business-link">
              <button className="login-business-btn">
                Are you a business? Get started here!
              </button>
            </div>

            <p className="login-footer-text">
              By continuing, you agree to Fragrance AI's{' '}
              <a href="#" className="login-footer-link">Terms of Service</a> and acknowledge you've read our{' '}
              <a href="#" className="login-footer-link">Privacy Policy</a>. Notice at collection.
            </p>
          </div>
        </div>
      </div>
      </div>
    </Fragment>
  );
};

export default LoginModal;
