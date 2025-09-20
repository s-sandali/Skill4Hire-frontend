import { useState } from 'react';
import { RiBuildingLine, RiMailLine, RiGlobalLine, RiMapPinLine, RiTeamLine, RiCalendarLine, RiUserLine, RiPhoneLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import CompanyDashboard from './CompanyDashboard';
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
        <div className="company-avatar">
          {sampleProfile?.logo ? (
            <img src={sampleProfile.logo} alt="Company Logo" />
          ) : (
            <RiBuildingLine />
          )}
        </div>
        <div className="company-info">
          <h1>{sampleProfile?.companyName || 'Your Company'}</h1>
          <p className="company-industry">{sampleProfile?.industry}</p>
          <div className="company-stats">
            <div className="stat">
              <span className="stat-number">{sampleProfile?.companySize || 'N/A'}</span>
              <span className="stat-label">Employees</span>
            </div>
            <div className="stat">
              <span className="stat-number">{sampleProfile?.foundedYear || 'N/A'}</span>
              <span className="stat-label">Founded</span>
            </div>
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Profile Score</span>
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
          Company Overview
        </button>
        <button 
          className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit Profile
        </button>
        <button 
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Job Postings
        </button>
        <button 
          className={`tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidates
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-overview">
            <div className="overview-grid">
              {/* Company Information Card */}
              <div className="overview-card">
                <div className="card-header">
                  <RiBuildingLine className="card-icon" />
                  <h3>Company Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Company Name</span>
                    <span className="info-value">{sampleProfile?.companyName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Industry</span>
                    <span className="info-value">{sampleProfile?.industry}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Company Size</span>
                    <span className="info-value">{sampleProfile?.companySize} employees</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Founded</span>
                    <span className="info-value">{sampleProfile?.foundedYear}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="overview-card">
                <div className="card-header">
                  <RiMailLine className="card-icon" />
                  <h3>Contact Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{sampleProfile?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{sampleProfile?.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Website</span>
                    <span className="info-value">
                      <a href={sampleProfile?.website} target="_blank" rel="noopener noreferrer">
                        {sampleProfile?.website}
                      </a>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{sampleProfile?.location}</span>
                  </div>
                </div>
              </div>

              {/* Contact Person Card */}
              <div className="overview-card">
                <div className="card-header">
                  <RiUserLine className="card-icon" />
                  <h3>Contact Person</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Contact Person</span>
                    <span className="info-value">{sampleProfile?.contactPerson || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Company Description Card */}
              <div className="overview-card full-width">
                <div className="card-header">
                  <RiBuildingLine className="card-icon" />
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
          <div className="jobs-tab">
            <h2>Job Postings</h2>
            <div className="jobs-grid">
              <div className="job-card">
                <h3>Senior Frontend Developer</h3>
                <p>Remote • Full-time</p>
                <span className="job-status active">Active</span>
                <div className="job-stats">
                  <span>45 Applications</span>
                  <span>12 Shortlisted</span>
                </div>
              </div>
              <div className="job-card">
                <h3>Backend Engineer</h3>
                <p>San Francisco, CA • Full-time</p>
                <span className="job-status active">Active</span>
                <div className="job-stats">
                  <span>32 Applications</span>
                  <span>8 Shortlisted</span>
                </div>
              </div>
            </div>
          </div>
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