import { useState } from 'react'
import { Link } from 'react-router-dom'
import brainLogo from '../assets/brain-logo.jpg'

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-brain">
              <img src={brainLogo} alt="SKILL4HIRE Brain Logo" className="brain-logo-img" />
            </div>
            <span className="logo-text">SKILL4HIRE</span>
          </div>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/login" className="nav-cta">Log In</Link>
          </div>
          
          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Unlock Your <span className="gradient-text">Potential</span>
              <br />with best match for your Skills
            </h1>
            <p className="hero-description">
              SKILL4HIRE connects talented professionals with cutting-edge opportunities. 
              Our intelligent platform matches your skills with the perfect career path.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-primary">Start Your Journey</Link>
              <button className="btn-secondary">Watch Demo</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="brain-container">
              <div className="brain-main">
                <img src={brainLogo} alt="SKILL4HIRE Brain Logo" className="hero-brain-logo" />
              </div>
              <div className="floating-elements">
                <div className="float-element element-1"></div>
                <div className="float-element element-2"></div>
                <div className="float-element element-3"></div>
                <div className="float-element element-4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Why Choose SKILL4HIRE?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-brain"></div>
              </div>
              <h3>AI-Powered Matching</h3>
              <p>Our advanced algorithms analyze your skills and match you with the perfect opportunities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-network"></div>
              </div>
              <h3>Global Network</h3>
              <p>Connect with top companies and professionals worldwide in our growing community.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-growth"></div>
              </div>
              <h3>Skill Development</h3>
              <p>Access personalized learning paths to enhance your expertise and stay competitive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Career?</h2>
            <p>Join thousands of professionals who have already found their dream opportunities.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary large">Get Started Now</Link>
              <button className="btn-outline">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="login-section">
        <div className="container">
          <div className="login-content">
            <h2>Already have an account?</h2>
            <p>Welcome back! Sign in to access your personalized dashboard and continue your journey.</p>
            <div className="login-actions">
              <Link to="/login" className="btn-primary large">Log In</Link>          
              
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-brain">
                <img src={brainLogo} alt="SKILL4HIRE Brain Logo" className="brain-logo-img" />
              </div>
              <span className="logo-text">SKILL4HIRE</span>
            </div>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SKILL4HIRE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
