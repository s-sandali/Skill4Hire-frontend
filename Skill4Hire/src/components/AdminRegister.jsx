import { useState } from 'react';
import { Link } from 'react-router-dom';
import brainLogo from '../assets/brain-logo.jpg';
import './AdminRegister.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Admin registration submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Admin registration submitted! Your request is under review.');
    } catch (error) {
      alert('Registration failed. Please try again.');
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
            <p><strong>⚠️ Important:</strong> Admin access requires approval and verification. This is a request form, not an immediate registration.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Admin Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">⚙️</span>
              Admin Registration
            </h2>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <Link to="/role-selection" className="btn-secondary">
              ← Back to Role Selection
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
                  🚀 Complete Registration
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
