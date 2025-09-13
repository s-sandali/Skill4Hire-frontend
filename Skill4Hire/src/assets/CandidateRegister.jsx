import { useState } from 'react';
import brainLogo from './brain-logo.jpg';
import './CandidateRegister.css';

const CandidateRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    mobile: '',
    experience: '',
    personalityType: '',
    jobRoleInterests: [],
    cv: null,
    portfolio: null
  });

  const [currentJobRole, setCurrentJobRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Personality types with attractive descriptions
  const personalityTypes = [
    {
      id: 'analytical',
      name: 'Analytical Thinker',
      icon: '🧠',
      description: 'Data-driven, logical, and detail-oriented'
    },
    {
      id: 'creative',
      name: 'Creative Visionary',
      icon: '🎨',
      description: 'Innovative, artistic, and out-of-the-box thinking'
    },
    {
      id: 'leader',
      name: 'Natural Leader',
      icon: '👑',
      description: 'Charismatic, decisive, and team-focused'
    },
    {
      id: 'collaborator',
      name: 'Team Player',
      icon: '🤝',
      description: 'Supportive, cooperative, and relationship-oriented'
    },
    {
      id: 'entrepreneur',
      name: 'Entrepreneur',
      icon: '🚀',
      description: 'Risk-taking, ambitious, and opportunity-driven'
    },
    {
      id: 'specialist',
      name: 'Technical Specialist',
      icon: '⚙️',
      description: 'Expert, focused, and mastery-oriented'
    },
    {
      id: 'communicator',
      name: 'Communicator',
      icon: '💬',
      description: 'Persuasive, articulate, and people-focused'
    },
    {
      id: 'problem-solver',
      name: 'Problem Solver',
      icon: '🔧',
      description: 'Resourceful, adaptable, and solution-focused'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handlePersonalitySelect = (personalityId) => {
    setFormData(prev => ({
      ...prev,
      personalityType: personalityId
    }));
  };

  const handleJobRoleAdd = () => {
    if (currentJobRole.trim() && !formData.jobRoleInterests.includes(currentJobRole.trim())) {
      setFormData(prev => ({
        ...prev,
        jobRoleInterests: [...prev.jobRoleInterests, currentJobRole.trim()]
      }));
      setCurrentJobRole('');
    }
  };

  const handleJobRoleRemove = (roleToRemove) => {
    setFormData(prev => ({
      ...prev,
      jobRoleInterests: prev.jobRoleInterests.filter(role => role !== roleToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJobRoleAdd();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      console.log('Form submitted:', formData);
      // Here you would typically send the data to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Registration successful! Welcome to Skill4Hire!');
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPersonality = personalityTypes.find(p => p.id === formData.personalityType);

  return (
    <div className="candidate-register">
      <div className="register-container">
        <div className="register-header">
          <div className="logo-section">
            <img src={brainLogo} alt="SKILL4HIRE Brain Logo" className="register-logo" />
            <h1>Join Skill4Hire</h1>
          </div>
          <p className="register-subtitle">Create your profile and unlock amazing opportunities</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span>
              Personal Information
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number *</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn Profile</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Years of Experience *</label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your experience level</option>
                <option value="0-1">0-1 years (Entry Level)</option>
                <option value="2-3">2-3 years (Junior)</option>
                <option value="4-6">4-6 years (Mid-Level)</option>
                <option value="7-10">7-10 years (Senior)</option>
                <option value="10+">10+ years (Expert)</option>
              </select>
            </div>
          </div>

          {/* Personality Type Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">🎭</span>
              Personality Type
            </h2>
            <p className="section-description">Choose the personality type that best describes you</p>
            
            <div className="personality-grid">
              {personalityTypes.map(personality => (
                <div
                  key={personality.id}
                  className={`personality-card ${formData.personalityType === personality.id ? 'selected' : ''}`}
                  onClick={() => handlePersonalitySelect(personality.id)}
                >
                  <div className="personality-icon">{personality.icon}</div>
                  <h3>{personality.name}</h3>
                  <p>{personality.description}</p>
                </div>
              ))}
            </div>
            
            {selectedPersonality && (
              <div className="selected-personality">
                <span>Selected: </span>
                <strong>{selectedPersonality.icon} {selectedPersonality.name}</strong>
              </div>
            )}
          </div>

          {/* Job Role Interests Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">💼</span>
              Job Role Interests
            </h2>
            <p className="section-description">Add job roles you're interested in by typing keywords</p>
            
            <div className="job-role-input">
              <input
                type="text"
                value={currentJobRole}
                onChange={(e) => setCurrentJobRole(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a job role (e.g., Frontend Developer, Data Scientist, UX Designer)"
              />
              <button type="button" onClick={handleJobRoleAdd} className="add-role-btn">
                Add Role
              </button>
            </div>
            
            {formData.jobRoleInterests.length > 0 && (
              <div className="job-roles-list">
                <h4>Your Job Role Interests:</h4>
                <div className="role-tags">
                  {formData.jobRoleInterests.map((role, index) => (
                    <span key={index} className="role-tag">
                      {role}
                      <button
                        type="button"
                        onClick={() => handleJobRoleRemove(role)}
                        className="remove-role"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📁</span>
              Documents & Portfolio
            </h2>
            
            <div className="file-upload-grid">
              <div className="file-upload-group">
                <label htmlFor="cv" className="file-label">
                  <div className="file-upload-box">
                    <div className="upload-icon">📄</div>
                    <h3>Upload CV/Resume</h3>
                    <p>PDF, DOC, or DOCX (Max 5MB)</p>
                    {formData.cv && (
                      <div className="file-selected">
                        ✓ {formData.cv.name}
                      </div>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="cv"
                  name="cv"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                />
              </div>
              
              <div className="file-upload-group">
                <label htmlFor="portfolio" className="file-label">
                  <div className="file-upload-box">
                    <div className="upload-icon">🎨</div>
                    <h3>Upload Portfolio</h3>
                    <p>PDF or ZIP (Max 10MB)</p>
                    {formData.portfolio && (
                      <div className="file-selected">
                        ✓ {formData.portfolio.name}
                      </div>
                    )}
                  </div>
                </label>
                <input
                  type="file"
                  id="portfolio"
                  name="portfolio"
                  onChange={handleFileChange}
                  accept=".pdf,.zip"
                  className="file-input"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Your Profile...
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

export default CandidateRegister;
