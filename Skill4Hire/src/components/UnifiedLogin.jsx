import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiEye, 
  FiEyeOff, 
  FiLock, 
  FiMail, 
  FiLogIn, 
  FiArrowLeft,
  FiHelpCircle,
  FiUserPlus
} from 'react-icons/fi';
import brainLogo from '../assets/brain-logo.jpg';
import { authService } from '../services/authService';
import './UnifiedLogin.css';

const UnifiedLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    setErrors({});
    
    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        }

        // Store user info for frontend use
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userId', response.id);

        // Redirect based on role
        switch (response.role) {
          case 'CANDIDATE':
             navigate('/candidate-home');
            break;
          case 'COMPANY':
            navigate('/company-dashboard');
            break;
          case 'EMPLOYEE':
            navigate('/employee-dashboard');
            break;
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setErrors({ general: response.message || 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality would be implemented here');
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="unified-login">
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
                <FiHelpCircle style={{marginRight: '8px'}} />
                {errors.general}
              </div>
            )}

            <div className="form-group">
               <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMail style={{ color: '#4a33faff', fontSize: '20px' }} />

                Email Address
              </label>
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
              <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <FiLock style={{ color: '#4a33faff', fontSize: '20px' }} />
                Password
              </label>
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
                  {showPassword ? <FiEyeOff /> : <FiEye />}
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
                  <FiLogIn style={{fontSize: '18px'}} /> Sign In
                </>
              )}
            </button>
          </form>

          
        </div>

        {/* Footer Links */}
        <div className="login-footer">
          <p>
            <FiUserPlus style={{marginRight: '8px'}} />
            Don't have an account? 
            <Link to="/role-selection" className="register-link">
              Create one here
            </Link>
          </p>
          <div className="footer-links">
            <Link to="/"><FiArrowLeft style={{marginRight: '6px'}} />Back to Home</Link>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;