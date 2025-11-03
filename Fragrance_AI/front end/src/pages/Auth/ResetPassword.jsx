import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Toast from '../../components/Common/Toast';
import './AuthPages.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setToastMessage('Invalid reset link. Please request a new password reset.');
      setToastType('error');
      setShowToast(true);
    }
  }, [token]);

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

  const validateConfirmPassword = (value) => {
    if (!value) {
      setConfirmPasswordError('');
      return false;
    }
    
    if (value !== formData.password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    setConfirmPasswordError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'password') {
      validatePassword(value);
      // Re-validate confirm password if it's already filled
      if (formData.confirmPassword) {
        validateConfirmPassword(formData.confirmPassword);
      }
    } else if (name === 'confirmPassword') {
      validateConfirmPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setToastMessage('Invalid reset link. Please request a new password reset.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (!validatePassword(formData.password) || !validateConfirmPassword(formData.confirmPassword)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setToastMessage('✅ Password reset successful. Please log in.');
        setToastType('success');
        setShowToast(true);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/?showLogin=true');
        }, 2000);
      } else {
        if (data.expired) {
          setTokenValid(false);
        }
        setToastMessage(data.message || 'Failed to reset password.');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setToastMessage('Unable to reset password. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">🌸 Fragrance AI</div>
            <h2 className="auth-title">Invalid Reset Link</h2>
            <p className="auth-subtitle">This password reset link is invalid or has expired.</p>
          </div>
          <div className="auth-footer">
            <button
              className="auth-link-button"
              onClick={() => navigate('/forgot-password')}
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">Fragrance AI</div>
          <h2 className="auth-title">Create New Password</h2>
          <p className="auth-subtitle">Enter your new password below.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-form-label">New Password</label>
            <div className="auth-password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`auth-form-input ${passwordError ? 'auth-input-error' : ''}`}
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M1 1l22 22M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <div className="auth-field-error">{passwordError}</div>
            )}
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label">Confirm Password</label>
            <div className="auth-password-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`auth-form-input ${confirmPasswordError ? 'auth-input-error' : ''}`}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M1 1l22 22M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <div className="auth-field-error">{confirmPasswordError}</div>
            )}
          </div>

          <button 
            type="submit" 
            className={`auth-submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !formData.password || !formData.confirmPassword || !!passwordError || !!confirmPasswordError}
          >
            {isLoading ? (
              <>
                <div className="auth-spinner"></div>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
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

export default ResetPassword;

