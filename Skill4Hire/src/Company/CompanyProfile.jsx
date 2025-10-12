import { useState } from 'react';
import { 
  RiBuildingLine, 
  RiMailLine, 
  RiGlobalLine, 
  RiMapPinLine, 
  RiTeamLine, 
  RiCalendarLine, 
  RiUserLine, 
  RiPhoneLine, 
  RiEditLine, 
  RiBriefcaseLine,
  RiShieldCheckLine,
  RiBarChartBoxLine,
  RiStarLine,
  RiTimeLine
} from 'react-icons/ri';
import CompanyDashboard from './CompanyDashboard';
import JobPostings from './JobPostings';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sample company profile data
  const [sampleProfile, setSampleProfile] = useState({
    id: "company-1",
    companyName: "TechCorp Solutions",
    email: "hr@techcorp.com",
    website: "https://www.techcorp.com",
    location: "San Francisco, CA",
    industry: "Technology",
    companySize: "51-200",
    description: "Leading technology solutions provider specializing in innovative software development and digital transformation. We help businesses modernize their operations through cutting-edge technology solutions.",
    logo: null,
    foundedYear: "2010",
    contactPerson: "Jane Smith",
    phone: "+1 (555) 123-4567"
  });

  const handleSaveProfile = async (profileData) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Simulate API call
      setTimeout(() => {
        const updatedProfile = {
          ...sampleProfile,
          ...profileData,
          id: sampleProfile.id
        };
        setSampleProfile(updatedProfile);
        setMessage('Company profile saved successfully!');
        setIsLoading(false);
        setActiveTab('profile'); // Switch back to profile view
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete this company profile?')) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      // Simulate API call
      setTimeout(() => {
        setSampleProfile(null);
        setMessage('Company profile deleted successfully!');
        setIsLoading(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting profile:', error);
      setMessage('Error deleting profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="company-profile-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Company Header */}
      <div className="company-header">
        <div className="company-logo-wrapper">
          <div className="company-avatar">
            {sampleProfile?.logo ? (
              <img src={sampleProfile.logo} alt="Company Logo" />
            ) : (
              <RiBuildingLine />
            )}
          </div>
          <div className="verified-badge">
            <RiShieldCheckLine />
            <span>Verified</span>
          </div>
        </div>
        
        <div className="company-info">
          <h1>{sampleProfile?.companyName || 'Your Company'}</h1>
          <div className="company-meta">
            <span className="meta-item">
              <RiBuildingLine /> {sampleProfile?.industry}
            </span>
            <span className="meta-item">
              <RiMapPinLine /> {sampleProfile?.location}
            </span>
          </div>
          
          <div className="company-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <RiTeamLine />
              </div>
              <div className="stat-info">
                <span className="stat-number">{sampleProfile?.companySize || 'N/A'}</span>
                <span className="stat-label">Team Size</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <RiCalendarLine />
              </div>
              <div className="stat-info">
                <span className="stat-number">{sampleProfile?.foundedYear || 'N/A'}</span>
                <span className="stat-label">Founded</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <RiStarLine />
              </div>
              <div className="stat-info">
                <span className="stat-number">95%</span>
                <span className="stat-label">Profile Score</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <RiBriefcaseLine />
              </div>
              <div className="stat-info">
                <span className="stat-number">12</span>
                <span className="stat-label">Active Jobs</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="company-actions">
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('edit')}
          >
            <RiEditLine /> Edit Profile
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <RiBarChartBoxLine />
          <span>Overview</span>
        </button>
        <button 
          className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <RiEditLine />
          <span>Edit Profile</span>
        </button>
        <button 
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <RiBriefcaseLine />
          <span>Job Postings</span>
        </button>
        <button 
          className={`tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          <RiTeamLine />
          <span>Candidates</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-overview">
            {/* Quick Stats Banner */}
            <div className="quick-stats-banner">
              <div className="quick-stat">
                <div className="quick-stat-icon">
                  <RiBriefcaseLine />
                </div>
                <div className="quick-stat-content">
                  <h4>12</h4>
                  <p>Active Jobs</p>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon">
                  <RiUserLine />
                </div>
                <div className="quick-stat-content">
                  <h4>48</h4>
                  <p>Applications</p>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon">
                  <RiTimeLine />
                </div>
                <div className="quick-stat-content">
                  <h4>5</h4>
                  <p>Interviews</p>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon">
                  <RiBarChartBoxLine />
                </div>
                <div className="quick-stat-content">
                  <h4>85%</h4>
                  <p>Response Rate</p>
                </div>
              </div>
            </div>
            
            <div className="overview-grid">
              {/* Company Information Card */}
              <div className="overview-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <RiBuildingLine />
                  </div>
                  <h3>Company Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <div className="info-icon">
                      <RiBuildingLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Company Name</span>
                      <span className="info-value">{sampleProfile?.companyName}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-icon">
                      <RiBarChartBoxLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Industry</span>
                      <span className="info-value">{sampleProfile?.industry}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-icon">
                      <RiTeamLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Company Size</span>
                      <span className="info-value">{sampleProfile?.companySize} employees</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-icon">
                      <RiCalendarLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Founded</span>
                      <span className="info-value">{sampleProfile?.foundedYear}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="overview-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <RiMailLine />
                  </div>
                  <h3>Contact Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <div className="info-icon">
                      <RiMailLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Email</span>
                      <span className="info-value">{sampleProfile?.email}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-icon">
                      <RiPhoneLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{sampleProfile?.phone}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-icon">
                      <RiGlobalLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Website</span>
                      <span className="info-value">
                        <a href={sampleProfile?.website} target="_blank" rel="noopener noreferrer">
                          {sampleProfile?.website}
                        </a>
                      </span>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-icon">
                      <RiMapPinLine />
                    </div>
                    <div className="info-details">
                      <span className="info-label">Location</span>
                      <span className="info-value">{sampleProfile?.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Person Card */}
              <div className="overview-card">
                <div className="card-header">
                  <div className="card-header-icon">
                    <RiUserLine />
                  </div>
                  <h3>Contact Person</h3>
                </div>
                <div className="card-content">
                  <div className="contact-person-card">
                    <div className="contact-avatar">
                      <RiUserLine />
                    </div>
                    <div className="contact-details">
                      <h4>{sampleProfile?.contactPerson || 'Not specified'}</h4>
                      <p>HR Manager</p>
                      <span className="contact-email">{sampleProfile?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Description Card */}
              <div className="overview-card full-width">
                <div className="card-header">
                  <div className="card-header-icon">
                    <RiBuildingLine />
                  </div>
                  <h3>About the Company</h3>
                </div>
                <div className="card-content">
                  <p className="company-description">
                    {sampleProfile?.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="edit-profile-tab">
            <h2 className="tab-title">Edit Company Profile</h2>
            <CompanyDashboard
              existingProfile={sampleProfile}
              onSave={handleSaveProfile}
              onDelete={handleDeleteProfile}
            />
          </div>
        )}

        {activeTab === 'jobs' && (
          <JobPostings />
        )}

        {activeTab === 'candidates' && (
          <div className="candidates-tab">
            <h2>Candidate Applications</h2>
            <div className="candidates-list">
              <div className="candidate-item">
                <div className="candidate-info">
                  <h3>John Doe</h3>
                  <p>Frontend Developer</p>
                  <span>Applied for: Senior Frontend Developer</span>
                </div>
                <div className="candidate-status">
                  <span className="status-badge interview">Interview Scheduled</span>
                </div>
              </div>
              <div className="candidate-item">
                <div className="candidate-info">
                  <h3>Sarah Wilson</h3>
                  <p>Backend Engineer</p>
                  <span>Applied for: Backend Engineer</span>
                </div>
                <div className="candidate-status">
                  <span className="status-badge review">Under Review</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;