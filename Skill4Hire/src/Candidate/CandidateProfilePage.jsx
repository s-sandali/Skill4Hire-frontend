import { useState } from 'react';
import { RiUserLine, RiMailLine, RiBookLine, RiBriefcaseLine, RiStarLine, RiFileTextLine, RiEditLine, RiDeleteBinLine, RiLogoutBoxLine } from 'react-icons/ri';
import CandidateProfileForm from './CandidateProfileForm';
import { authService } from '../services/authService';
import './CandidateProfilePage.css';

const CandidateProfilePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  // Sample data for demonstration
  const [sampleProfile, setSampleProfile] = useState({
    id: "sample-1",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    education: "BSc in Computer Science, University of Tech (2018-2022)",
    experience: "2 years as Frontend Developer at TechCorp",
    skills: ["JavaScript", "React", "CSS", "HTML", "Node.js", "UI/UX"],
    resume: { name: "alex_johnson_resume.pdf" },
    location: "San Francisco, CA",
    title: "Frontend Developer"
  });

  const handleSaveProfile = (profileData) => {
    // Update the sample profile with new data
    const updatedProfile = {
      ...sampleProfile,
      ...profileData,
      id: sampleProfile.id // Preserve the ID
    };
    setSampleProfile(updatedProfile);
    
    // Also update in the profiles array if needed
    if (profiles.some(profile => profile.id === sampleProfile.id)) {
      setProfiles(profiles.map(profile => 
        profile.id === sampleProfile.id ? updatedProfile : profile
      ));
    } else {
      setProfiles([...profiles, updatedProfile]);
    }
    
    setActiveTab('profile'); // Switch back to profile view after saving
  };

  const handleDeleteProfile = (profileId) => {
    setProfiles(profiles.filter(profile => profile.id !== profileId));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Clear local storage and redirect regardless of API call success
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('rememberedEmail');
      window.location.href = '/';
    }
  };

  return (
    <div className="candidate-profile-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <RiUserLine />
              </div>
              <h1>Candidate Profile</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <RiUserLine />
              </div>
              <div className="user-details">
                <span className="user-name">{sampleProfile.name}</span>
                <span className="user-role">{sampleProfile.title}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <RiLogoutBoxLine />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Stats Section */}
      <div className="profile-stats-section">
        <div className="profile-avatar-large">
          <RiUserLine />
        </div>
        <div className="profile-info">
          <h1>{sampleProfile.name}</h1>
          <p>{sampleProfile.title}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">95%</span>
              <span className="stat-label">Profile Score</span>
            </div>
            <div className="stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Matches</span>
            </div>
            <div className="stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Interviews</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="btn-primary" onClick={() => setActiveTab('edit')}>
            <RiEditLine /> Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Overview
        </button>
        <button 
          className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit Profile
        </button>
        <button 
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Job Matches
        </button>
        <button 
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-overview">
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-header">
                  <RiUserLine className="card-icon" />
                  <h3>Personal Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{sampleProfile.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{sampleProfile.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{sampleProfile.location}</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiBookLine className="card-icon" />
                  <h3>Education</h3>
                </div>
                <div className="card-content">
                  <div className="education-item">
                    <h4>BSc in Computer Science</h4>
                    <p>University of Technology</p>
                    <span className="education-period">2018 - 2022</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiBriefcaseLine className="card-icon" />
                  <h3>Experience</h3>
                </div>
                <div className="card-content">
                  <div className="experience-item">
                    <h4>Frontend Developer</h4>
                    <p>TechCorp Inc.</p>
                    <span className="experience-period">2022 - Present</span>
                    <p className="experience-description">
                      Developed responsive web applications using React and Node.js
                    </p>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiStarLine className="card-icon" />
                  <h3>Skills</h3>
                </div>
                <div className="card-content">
                  <div className="skills-container">
                    {sampleProfile.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiFileTextLine className="card-icon" />
                  <h3>Resume</h3>
                </div>
                <div className="card-content">
                  <div className="resume-item">
                    <p>{sampleProfile.resume.name}</p>
                    <button className="btn-outline small">Download</button>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiStarLine className="card-icon" />
                  <h3>Profile Completeness</h3>
                </div>
                <div className="card-content">
                  <div className="completeness-meter">
                    <div className="meter-bar">
                      <div className="meter-fill" style={{width: '95%'}}></div>
                    </div>
                    <span className="completeness-percent">95% Complete</span>
                  </div>
                  <p className="completeness-tip">
                    Add your portfolio to reach 100% profile completeness
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

         {activeTab === 'edit' && (
          <div className="edit-profile-tab">
            <h2 className="tab-title">Edit Your Profile</h2>
            <CandidateProfileForm
              existingProfile={sampleProfile}
              onSave={handleSaveProfile}
              onDelete={handleDeleteProfile}
            />
          </div>
        )}

         {activeTab === 'matches' && (
          <div className="matches-tab">
            <h2>Your Job Matches</h2>
            <div className="matches-grid">
              <div className="match-card">
                <div className="match-card-header">
                  <h3>Senior Frontend Developer</h3>
                  <span className="match-score">98% Match</span>
                </div>
                <div className="match-card-content">
                  <p>TechInnovate Inc.</p>
                  <p>San Francisco, CA • Remote Possible</p>
                  <div className="match-skills">
                    <span>React</span>
                    <span>TypeScript</span>
                    <span>CSS</span>
                  </div>
                </div>
                <div className="match-card-actions">
                  <button className="btn-primary">Apply Now</button>
                  <button className="btn-outline">View Details</button>
                </div>
              </div>

              <div className="match-card">
                <div className="match-card-header">
                  <h3>UI/UX Engineer</h3>
                  <span className="match-score">92% Match</span>
                </div>
                <div className="match-card-content">
                  <p>DesignHub</p>
                  <p>New York, NY • On-site</p>
                  <div className="match-skills">
                    <span>Figma</span>
                    <span>React</span>
                    <span>UI Design</span>
                  </div>
                </div>
                <div className="match-card-actions">
                  <button className="btn-primary">Apply Now</button>
                  <button className="btn-outline">View Details</button>
                </div>
              </div>

              <div className="match-card">
                <div className="match-card-header">
                  <h3>Full Stack Developer</h3>
                  <span className="match-score">89% Match</span>
                </div>
                <div className="match-card-content">
                  <p>StartUpVision</p>
                  <p>Austin, TX • Hybrid</p>
                  <div className="match-skills">
                    <span>Node.js</span>
                    <span>React</span>
                    <span>MongoDB</span>
                  </div>
                </div>
                <div className="match-card-actions">
                  <button className="btn-primary">Apply Now</button>
                  <button className="btn-outline">View Details</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-tab">
            <h2>Your Applications</h2>
            <div className="applications-list">
              <div className="application-item">
                <div className="application-info">
                  <h3>Senior Frontend Developer</h3>
                  <p>TechInnovate Inc.</p>
                  <span className="application-date">Applied on: Oct 15, 2023</span>
                </div>
                <div className="application-status">
                  <span className="status-badge in-review">In Review</span>
                </div>
              </div>

              <div className="application-item">
                <div className="application-info">
                  <h3>UI/UX Engineer</h3>
                  <p>DesignHub</p>
                  <span className="application-date">Applied on: Oct 10, 2023</span>
                </div>
                <div className="application-status">
                  <span className="status-badge interview">Interview Scheduled</span>
                </div>
              </div>

              <div className="application-item">
                <div className="application-info">
                  <h3>Full Stack Developer</h3>
                  <p>StartUpVision</p>
                  <span className="application-date">Applied on: Oct 5, 2023</span>
                </div>
                <div className="application-status">
                  <span className="status-badge rejected">Not Selected</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfilePage;