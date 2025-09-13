import { useState } from 'react';
import { Link } from 'react-router-dom';
import brainLogo from './brain-logo.jpg';
import './CandidateLogin.css';

const CandidateLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate login API call
      console.log('Login attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
        // On successful login
      alert('Login successful! Welcome back to Skill4Hire!');
      // Here you would typically redirect to dashboard or handle authentication

    } catch (error) {
      setErrors({ general: 'Login failed. Please check your credentials and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality would be implemented here');
  };

  return (
    <div className="candidate-login">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="logo-section">
            <img src={brainLogo} alt="SKILL4HIRE Brain Logo" className="login-logo" />
            <h1>Welcome Back</h1>
          </div>
          <p className="login-subtitle">Sign in to your Skill4Hire account</p>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  🔐 Sign In
                </>
              )}
            </button>
          </form>

          {/* Alternative Login Methods */}
          <div className="alternative-login">
            <div className="divider">
              <span>or continue with</span>
            </div>
            
            <div className="social-login-buttons">
              <button className="social-btn google-btn">
                <span className="social-icon">🔍</span>
                Google
              </button>
              <button className="social-btn linkedin-btn">
                <span className="social-icon">💼</span>
                LinkedIn
              </button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="login-footer">
          <p>
            Don't have an account? 
            <Link to="/register" className="register-link">
              Create one here
            </Link>
          </p>
          <div className="footer-links">
            <Link to="/">Back to Home</Link>
            <span>•</span>
            <a href="#help">Help Center</a>
            <span>•</span>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
