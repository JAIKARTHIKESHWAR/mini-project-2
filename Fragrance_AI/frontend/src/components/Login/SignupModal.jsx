import React, { useState, useRef, Fragment, useEffect } from 'react';
import './SignupModal.css';
import Toast from '../Common/Toast';

const SignupModal = ({ isOpen, onClose, onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    birthdate: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTips, setShowPasswordTips] = useState(false);
  const [showBirthdateTips, setShowBirthdateTips] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null); // 'weak', 'medium', 'strong'
  const [passwordStrengthMessage, setPasswordStrengthMessage] = useState('');
  const [birthdateError, setBirthdateError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const dateInputRef = useRef(null);

  // Reset fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '', birthdate: '' });
      setShowPassword(false);
      setShowPasswordTips(false);
      setShowBirthdateTips(false);
      setIsLoading(false);
      setError('');
      setEmailError('');
      setPasswordError('');
      setPasswordStrength(null);
      setPasswordStrengthMessage('');
      setBirthdateError('');
      setShowToast(false);
      setToastMessage('');
      setToastType('success');
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

  // Calculate password strength
  const calculatePasswordStrength = (value) => {
    if (!value || value.length < 8) {
      return { strength: 'weak', message: '❌ Weak password — must contain uppercase, number, and special character.', valid: false };
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const criteriaCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (criteriaCount === 4) {
      return { strength: 'strong', message: '✅ Strong password.', valid: true };
    } else if (criteriaCount >= 3) {
      return { strength: 'medium', message: '⚠️ Medium password — consider making it stronger.', valid: true };
    } else {
      return { strength: 'weak', message: '❌ Weak password — must contain uppercase, number, and special character.', valid: false };
    }
  };

  // Real-time password validation
  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('');
      setPasswordStrength(null);
      setPasswordStrengthMessage('');
      return false;
    }

    const strengthResult = calculatePasswordStrength(value);
    setPasswordStrength(strengthResult.strength);
    setPasswordStrengthMessage(strengthResult.message);

    if (!strengthResult.valid) {
      setPasswordError(strengthResult.message);
      return false;
    }

    setPasswordError('');
    return true;
  };

  // Birthdate validation
  const validateBirthdate = (value) => {
    if (!value) {
      setBirthdateError('');
      return false;
    }
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      setBirthdateError('You must be at least 13 years old');
      return false;
    }
    setBirthdateError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Real-time validation
    if (name === 'email') {
      validateEmail(value);
    } else if (name === 'password') {
      validatePassword(value);
    } else if (name === 'birthdate') {
      validateBirthdate(value);
    }
    
    setError('');
  };

  // Check if form is valid for enabling Continue button (without side effects)
  const isFormValid = () => {
    if (!formData.email || !formData.password || !formData.birthdate) {
      return false;
    }
    
    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValid = emailRegex.test(formData.email) && !emailError;
    
    // Check password - must be at least medium strength (or strong)
    const passwordStrengthCheck = calculatePasswordStrength(formData.password);
    const passwordValid = passwordStrengthCheck.valid && passwordStrength !== 'weak';
    
    // Check birthdate (age >= 13)
    const birthDate = new Date(formData.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const birthdateValid = age >= 13 && !birthdateError;
    
    return emailValid && passwordValid && birthdateValid;
  };

  const handleDatePickerClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');
    setBirthdateError('');

    // Validate before submitting
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isBirthdateValid = validateBirthdate(formData.birthdate);

    if (!isEmailValid || !isPasswordValid || !isBirthdateValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          birthdate: formData.birthdate,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        if (data.message === 'User with this email or username already exists') {
          setEmailError('Email already registered. Please log in instead.');
        } else if (res.status === 400 && data.message.includes('Invalid email format')) {
          setEmailError('Invalid email format');
        } else if (res.status === 400 && data.message.includes('Password must be at least 8 characters')) {
          setPasswordError('Password must be at least 8 characters');
        } else {
          setError(data.message || 'Signup failed');
        }
      } else {
        // Success - check if email verification is required
        if (data.requiresVerification) {
          // Show email verification message
          setToastMessage('✅ Account created! Please check your email to verify your account.');
          setToastType('success');
          setShowToast(true);
          
          // Don't store token - user must verify email first
          localStorage.removeItem('fragrance_token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('fragrance_user');
          
          // Redirect to login after 3 seconds (give time to read message)
          setTimeout(() => {
            onClose(); // Close signup modal
            // Switch to login modal via parent callback
            if (onSwitchToLogin) {
              onSwitchToLogin();
            }
          }, 3000);
        } else {
          // Legacy flow (OAuth users might not need verification)
          setToastMessage('✅ Account created successfully! Redirecting to login...');
          setToastType('success');
          setShowToast(true);
          
          localStorage.removeItem('fragrance_token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('fragrance_user');
          
          setTimeout(() => {
            onClose();
            if (onSwitchToLogin) {
              onSwitchToLogin();
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to sign up. Please try again.');
      setToastMessage('❌ Signup failed! Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:5000/api/auth/google?source=signup';
  };

  const handleFacebookSignup = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  return (
    <Fragment>
      <Toast 
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="signup-modal-overlay" onClick={onClose}>
        <div className="signup-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="signup-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="signup-modal-content">
            <div className="signup-modal-header">
              <div className="signup-modal-logo">
                <div className="signup-logo-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    <path d="M19 15L20.09 19.26L24 20L20.09 20.74L19 24L17.91 20.74L14 20L17.91 19.26L19 15Z" fill="currentColor"/>
                    <path d="M5 15L6.09 19.26L10 20L6.09 20.74L5 24L3.91 20.74L0 20L3.91 19.26L5 15Z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="signup-logo-text">Fragrance AI</span>
              </div>
              <h2 className="signup-modal-title">Welcome to Fragrance AI</h2>
              <p className="signup-modal-subtitle">Find new ideas to try</p>
            </div>

            <form className="signup-modal-form" onSubmit={handleSubmit}>
              {error && (
                <div className="signup-error" style={{ color: '#ef4444', marginBottom: '8px' }}>{error}</div>
              )}
              <div className="signup-form-group">
                <label className="signup-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`signup-form-input ${emailError ? 'signup-input-error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => validateEmail(formData.email)}
                  required
                />
                {emailError && (
                  <div className="signup-field-error">{emailError}</div>
                )}
              </div>

            <div className="signup-form-group">
              <div className="signup-label-container">
                <label className="signup-form-label">Password</label>
                <div className="signup-tips-container">
                  <button 
                    type="button" 
                    className="signup-tips-trigger"
                    onClick={() => setShowPasswordTips(!showPasswordTips)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
                    </svg>
                  </button>
                  {showPasswordTips && (
                    <div className="signup-tips-overlay" onClick={() => setShowPasswordTips(false)}>
                      <div className="signup-tips-card" onClick={(e) => e.stopPropagation()}>
                        <div className="signup-tips-header">
                          <h4>Password Requirements</h4>
                          <button 
                            className="signup-tips-close"
                            onClick={() => setShowPasswordTips(false)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                        <ul className="signup-tips-list">
                          <li className="signup-tip-item">• Use 8 or more characters</li>
                          <li className="signup-tip-item">• Include letters and numbers</li>
                          <li className="signup-tip-item">• Add symbols for extra security</li>
                          <li className="signup-tip-item">• Avoid common words and phrases</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="signup-password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`signup-form-input ${passwordError ? 'signup-input-error' : ''}`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => validatePassword(formData.password)}
                  required
                />
                <button
                  type="button"
                  className="signup-password-toggle"
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
              {passwordStrength && (
                <div className={`signup-password-strength signup-password-strength-${passwordStrength}`}>
                  {passwordStrengthMessage}
                  <div className="signup-password-strength-bar">
                    <div 
                      className={`signup-password-strength-fill signup-password-strength-fill-${passwordStrength}`}
                      style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                    ></div>
                  </div>
                </div>
              )}
              {!passwordStrength && (
                <div className="signup-password-hint">
                  Use 8 or more letters, numbers and symbols
                </div>
              )}
              {passwordError && passwordStrength !== 'weak' && (
                <div className="signup-field-error">{passwordError}</div>
              )}
            </div>

            <div className="signup-form-group">
              <div className="signup-label-container">
                <label className="signup-form-label">Birthdate</label>
                <div className="signup-tips-container">
                  <button 
                    type="button" 
                    className="signup-tips-trigger"
                    onMouseEnter={() => setShowBirthdateTips(true)}
                    onMouseLeave={() => setShowBirthdateTips(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
                    </svg>
                  </button>
                  {showBirthdateTips && (
                    <div className="signup-tips-tooltip">
                      We use your birthdate to personalize your experience
                    </div>
                  )}
                </div>
              </div>
              <div className="signup-birthdate-container">
                <input
                  ref={dateInputRef}
                  type="date"
                  name="birthdate"
                  className={`signup-form-input ${birthdateError ? 'signup-input-error' : ''}`}
                  value={formData.birthdate}
                  onChange={handleChange}
                  onBlur={() => validateBirthdate(formData.birthdate)}
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                  required
                />
                <button
                  type="button"
                  className="signup-calendar-icon"
                  onClick={handleDatePickerClick}
                  aria-label="Open date picker"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              {birthdateError ? (
                <div className="signup-field-error">{birthdateError}</div>
              ) : (
                <div className="signup-birthdate-hint">
                  mm/dd/yyyy
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className={`signup-submit-btn ${isLoading ? 'loading' : ''} ${!isFormValid() ? 'disabled' : ''}`}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <div className="signup-spinner"></div>
                  Creating account...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <div className="signup-divider">
            <span>OR</span>
          </div>

          <div className="signup-social-buttons">
            <button className="signup-social-btn signup-google-btn" onClick={handleGoogleSignup}>
              <div className="signup-social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              Continue with Google
            </button>

            <button className="signup-social-btn signup-facebook-btn" onClick={handleFacebookSignup}>
              <div className="signup-social-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              Continue with Facebook
            </button>
          </div>

          <div className="signup-modal-footer">
            <p className="signup-footer-text">
              By continuing, you agree to Fragrance AI's{' '}
              <a href="#" className="signup-footer-link">Terms of Service</a> and acknowledge you've read our{' '}
              <a href="#" className="signup-footer-link">Privacy Policy</a>. Notice at collection.
            </p>
            
            <div className="signup-switch-auth">
              <span>Already a member? </span>
              <button className="signup-switch-link" onClick={onSwitchToLogin}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Fragment>
  );
};

export default SignupModal;