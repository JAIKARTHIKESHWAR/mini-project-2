import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Common/Toast';
import './AuthPages.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const navigate = useNavigate();

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

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setToastMessage(data.message || 'Password reset link has been sent to your email.');
        setToastType('success');
        setShowToast(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/?showLogin=true');
        }, 3000);
      } else {
        setToastMessage(data.message || 'Failed to send password reset link.');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setToastMessage('Unable to send password reset link. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🌸 Fragrance AI</div>
          <h2 className="auth-title">Reset Your Password</h2>
          <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-form-label">Email</label>
            <input
              type="email"
              className={`auth-form-input ${emailError ? 'auth-input-error' : ''}`}
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              required
            />
            {emailError && (
              <div className="auth-field-error">{emailError}</div>
            )}
          </div>

          <button 
            type="submit" 
            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !email || !!emailError}
          >
            {isLoading ? (
              <>
                <div className="auth-spinner"></div>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="auth-footer">
            <button
              type="button"
              className="auth-link-button"
              onClick={() => navigate('/?showLogin=true')}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>

      <Toast 
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ForgotPassword;

