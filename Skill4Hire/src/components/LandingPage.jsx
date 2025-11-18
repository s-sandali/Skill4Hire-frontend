import { useEffect, useRef, useState } from 'react'
import "./LandingPage.css";

import { Link } from 'react-router-dom'
import brainLogo from '../assets/brain-logo.jpg'



import { 
  RiUserFollowLine, 
  RiShakeHandsLine, 
  RiBriefcase4Line,
  RiFileList3Line,
  RiListCheck,
  RiCalendarScheduleLine,
  RiMedalLine,
  RiBarChartBoxLine,
  RiNotification3Line,
  RiTimeLine,
  RiStarSmileLine
} from 'react-icons/ri';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const countersRef = useRef([])
  const hasCountedRef = useRef(false)

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal')
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('reveal-visible')
        })
      },
      { threshold: 0.1 }
    )
    revealEls.forEach((el) => revealObserver.observe(el))

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasCountedRef.current) {
            hasCountedRef.current = true
            countersRef.current.forEach((el) => {
              if (!el) return
              const target = Number(el.getAttribute('data-target') || '0')
              const duration = 1500
              const start = performance.now()
              const format = el.getAttribute('data-format') || 'plain'
              const step = (now) => {
                const p = Math.min((now - start) / duration, 1)
                const eased = 1 - Math.pow(1 - p, 3)
                const val = Math.floor(target * eased)
                el.textContent =
                  format === 'kplus' ? `${val.toLocaleString()}+` : format === 'percent' ? `${val}%` : val.toLocaleString()
                if (p < 1) requestAnimationFrame(step)
              }
              requestAnimationFrame(step)
            })
          }
        })
      },
      { threshold: 0.4 }
    )
    const stats = document.getElementById('stats')
    if (stats) counterObserver.observe(stats)

    return () => {
      revealObserver.disconnect()
      counterObserver.disconnect()
    }
  }, [])

  return (
    <div className="landing-page">
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
            <button type="button" className="nav-link" onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button type="button" className="nav-link" onClick={() => scrollToSection('about')}>
              About
            </button>
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
      <section className="hero reveal">
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
              <Link to="/role-selection" className="btn-primary">Start Your Journey</Link>
              
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

      {/* Stats Section */}
      <section className="stats reveal" id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3 ref={(el) => (countersRef.current[0] = el)} data-target="100" data-format="kplus">0+</h3>
              <p>Jobs posted monthly</p>
            </div>
            <div className="stat-card">
              <h3 ref={(el) => (countersRef.current[1] = el)} data-target="95" data-format="percent">0%</h3>
              <p>Placement success rate</p>
            </div>
            <div className="stat-card">
              <h3 ref={(el) => (countersRef.current[2] = el)} data-target="1000" data-format="plain">0</h3>
              <p>Talent profiles matched</p>
            </div>
            <div className="stat-card">
              <h3 ref={(el) => (countersRef.current[3] = el)} data-target="5000" data-format="kplus">0+</h3>
              <p>Hiring partners worldwide</p>
            </div>
          </div>
        </div>
      </section>

      
      {/* How It Works Section */}
      <section className="how-it-works reveal" id="about">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="hiw-split">
            <div className="hiw-column hiw-candidates">
              <div className="hiw-header">
                <div className="hiw-icon">
                  <RiUserFollowLine />
                </div>
                <h3>For Candidates</h3>
              </div>
              <div className="steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h4>Create Profile</h4>
                    <p>Showcase your skills, experience, and career goals.</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h4>Get Matched</h4>
                    <p>AI and experts connect you with top opportunities.</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h4>Land Your Dream Job</h4>
                    <p>Interview, negotiate, and start your next chapter.</p>
                  </div>
                </div>
              </div>
              <Link to="register/candidate" className="btn-primary small">Find Your Next Opportunity</Link>
            </div>

            <div className="hiw-column hiw-companies">
              <div className="hiw-header">
                <div className="hiw-icon">
                  <RiBriefcase4Line />
                </div>
                <h3>For Companies</h3>
              </div>
              <div className="steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h4>Post Jobs</h4>
                    <p>Create roles with required skills and culture fit.</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h4>Review Matches</h4>
                    <p>Get curated shortlists with verified skill alignment.</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h4>Hire Top Talent</h4>
                    <p>Schedule interviews and hire faster with confidence.</p>
                  </div>
                </div>
              </div>
              <Link to="/register/company" className="btn-outline small">Post a Job</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Extended Key Features */}
      <section className="key-features reveal" id="features">
        <div className="container">
          <h2 className="section-title">Key Platform Features</h2>
          <div className="features-grid extended">
            <div className="feature-card">
              <div className="feature-icon">
                <RiNotification3Line />
              </div>
              <h3>Real-time Notifications</h3>
              <p>Stay informed about matches, interviews, and offers instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <RiCalendarScheduleLine />
              </div>
              <h3>Interview Scheduling</h3>
              <p>Coordinate interviews seamlessly with calendar integrations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <RiMedalLine />
              </div>
              <h3>Skills Assessments</h3>
              <p>Validate skills with integrated assessments and coding tasks.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <RiBarChartBoxLine />
              </div>
              <h3>Application Tracking</h3>
              <p>Track every step from application to offer in one place.</p>
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
              <Link to="/role-selection" className="btn-primary large">Get Started Now</Link>
              
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