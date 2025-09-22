import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSettings, 
  FiUser,
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowLeft,
  FiCheck,
  FiAlertTriangle
} from 'react-icons/fi';
import brainLogo from '../assets/brain-logo.jpg';
import { authService } from '../services/authService';
import './AdminRegister.css';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminName: '',  // ← ADD THIS FIELD
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
    
    // ADD ADMIN NAME VALIDATION
    if (!formData.adminName) {
      newErrors.adminName = 'Admin name is required';
    }
    
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
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await authService.registerAdmin(formData);
      
      if (response.success) {
        localStorage.setItem('registeredRole', 'ADMIN');
        alert('Admin registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        setErrors({ general: response.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-register">
      <div className="register-container">
        <div className="register-header">
          <div className="logo-section">
            <img src={brainLogo} alt="SKILL4HIRE Brain Logo" className="register-logo" />
            <h1>Admin Registration</h1>
          </div>
          <p className="register-subtitle">Request administrative access to the Skill4Hire platform</p>
          <div className="admin-notice">
            <p>
              <FiAlertTriangle style={{marginRight: '8px'}} />
              <strong>Important:</strong> Admin access requires approval. Your request will be reviewed by our team.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.general && (
            <div className="error-message general-error">
              <FiAlertTriangle style={{marginRight: '8px'}} />
              {errors.general}
            </div>
          )}

          {/* Admin Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <FiSettings className="section-icon" />
              Admin Registration
            </h2>

            {/* ADD ADMIN NAME FIELD */}
            <div className="form-group">
              <label htmlFor="adminName">
                <FiUser style={{marginRight: '8px'}} />
                Admin Name *
              </label>
              <input
                type="text"
                id="adminName"
                name="adminName"
                value={formData.adminName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.adminName ? 'error' : ''}
                required
              />
              {errors.adminName && (
                <span className="error-text">{errors.adminName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FiMail style={{marginRight: '8px'}} />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FiLock style={{marginRight: '8px'}} />
                Password *
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
                  required
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
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <Link to="/role-selection" className="btn-secondary">
              <FiArrowLeft style={{marginRight: '8px'}} />
              Back to Role Selection
            </Link>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <FiCheck style={{fontSize: '18px'}} /> Complete Registration
                </>
              )}
            </button>

            <p className="form-note">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;