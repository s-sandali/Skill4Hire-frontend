import { useEffect, useState } from 'react';
import { RiUserLine, RiMailLine, RiBookLine, RiBriefcaseLine, RiStarLine, RiFileTextLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';
import { candidateService } from '../services/candidateService';
import './CandidateProfilePage.css';

const CandidateProfilePage = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // Load candidate profile from backend
  useEffect(() => {
    fetchCandidateProfile();
  }, []);

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true);
      const profile = await candidateService.getProfile();
      setCandidate(profile);
      
      // Fetch profile completeness
      const completenessData = await candidateService.checkProfileCompleteness();
      setProfileCompleteness(completenessData.completeness || completenessData.completenessPercentage || 0);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load candidate applications when Applications tab becomes active
  useEffect(() => {
    if (activeTab !== 'applications') return;

    let cancelled = false;
    async function fetchApplications() {
      setAppsLoading(true);
      setAppsError('');
      try {
        const applicationsData = await candidateService.getApplications();
        if (!cancelled) {
          setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        }
      } catch (err) {
        if (!cancelled) setAppsError(err?.message || 'Failed to load applications');
      } finally {
        if (!cancelled) setAppsLoading(false);
      }
    }
    fetchApplications();
    return () => { cancelled = true; };
  }, [activeTab]);

  const statusToBadgeClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (['in_review', 'in review', 'review', 'pending'].includes(s)) return 'in-review';
    if (['interview', 'interview scheduled', 'scheduled'].includes(s)) return 'interview';
    if (['rejected', 'not selected', 'declined'].includes(s)) return 'rejected';
    return 'in-review';
  };

  const handleSaveProfile = async (profileData) => {
    try {
      // Map the form data to backend DTO structure
      const backendProfileData = {
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        location: profileData.location,
        title: profileData.title,
        headline: profileData.headline,
        skills: profileData.skills,
        education: profileData.education,
        experience: profileData.experience
      };

      const updatedProfile = await candidateService.updateProfile(backendProfileData);
      setCandidate(updatedProfile);
      
      // Refresh completeness score
      const completenessData = await candidateService.checkProfileCompleteness();
      setProfileCompleteness(completenessData.completeness || completenessData.completenessPercentage || 0);
      
      setActiveTab('profile');
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  // Format experience for display using backend DTO structure
  const formatExperience = (experience) => {
    if (!experience || !experience.isExperienced) {
      return "No experience listed yet.";
    }
    
    const { role, company, yearsOfExperience } = experience;
    
    let experienceText = "";
    if (role) experienceText += role;
    if (company) experienceText += experienceText ? ` at ${company}` : company;
    if (yearsOfExperience) experienceText += experienceText ? ` (${yearsOfExperience} years)` : `${yearsOfExperience} years experience`;
    
    return experienceText || "Experience details available";
  };

  // Format education for display using backend DTO structure
  const formatEducation = (education) => {
    if (!education) return "No education listed yet.";
    
    const { degree, institution, graduationYear } = education;
    
    let educationText = "";
    if (degree) educationText += degree;
    if (institution) educationText += educationText ? ` from ${institution}` : institution;
    if (graduationYear) educationText += educationText ? `, ${graduationYear}` : `Graduated ${graduationYear}`;
    
    return educationText || "Education details available";
  };

  if (loading) {
    return (
      <div className="candidate-profile-page">
        <div className="loading">Loading your profile...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="candidate-profile-page">
        <div className="no-profile">
          <h2>Profile not found</h2>
          <p>Please complete your profile setup.</p>
          <button className="btn-primary" onClick={() => setActiveTab('edit')}>
            <RiEditLine /> Setup Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {candidate.profilePicturePath ? (
            <img src={candidate.profilePicturePath} alt="Profile" />
          ) : (
            <RiUserLine />
          )}
        </div>
        <div className="profile-info">
          <h1>{candidate.name || "Candidate Name"}</h1>
          <p>{candidate.title || "Professional"}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{profileCompleteness}%</span>
              <span className="stat-label">Profile Score</span>
            </div>
            <div className="stat">
              <span className="stat-number">{applications.length}</span>
              <span className="stat-label">Applications</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {applications.filter(app => 
                  ['interview', 'interview scheduled', 'scheduled'].includes(String(app.status || '').toLowerCase())
                ).length}
              </span>
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
                    <span className="info-value">{candidate.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{candidate.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{candidate.location || "Not specified"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{candidate.phoneNumber || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiBookLine className="card-icon" />
                  <h3>Education</h3>
                </div>
                <div className="card-content">
                  {candidate.education ? (
                    <div className="education-item">
                      <h4>{candidate.education.degree || "Degree not specified"}</h4>
                      <p>{candidate.education.institution || "Institution not specified"}</p>
                      {candidate.education.graduationYear && (
                        <span className="education-period">Graduated {candidate.education.graduationYear}</span>
                      )}
                    </div>
                  ) : (
                    <p>No education information available</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiBriefcaseLine className="card-icon" />
                  <h3>Experience</h3>
                </div>
                <div className="card-content">
                  {candidate.experience && candidate.experience.isExperienced ? (
                    <div className="experience-item">
                      <h4>{candidate.experience.role || "Role not specified"}</h4>
                      <p>{candidate.experience.company || "Company not specified"}</p>
                      {candidate.experience.yearsOfExperience && (
                        <span className="experience-period">{candidate.experience.yearsOfExperience} years of experience</span>
                      )}
                    </div>
                  ) : (
                    <p>No experience listed</p>
                  )}
                </div>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <RiStarLine className="card-icon" />
                  <h3>Skills</h3>
                </div>
                <div className="card-content">
                  <div className="skills-container">
                    {candidate.skills && candidate.skills.length > 0 ? (
                      candidate.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))
                    ) : (
                      <p>No skills listed</p>
                    )}
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
                    <p>{candidate.resumePath ? candidate.resumePath.split('/').pop() : "No resume uploaded"}</p>
                    {candidate.resumePath && (
                      <button className="btn-outline small">Download</button>
                    )}
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
                      <div className="meter-fill" style={{width: `${profileCompleteness}%`}}></div>
                    </div>
                    <span className="completeness-percent">{profileCompleteness}% Complete</span>
                  </div>
                  <p className="completeness-tip">
                    {profileCompleteness < 50 
                      ? "Complete your profile to improve job matches." 
                      : profileCompleteness < 100 
                        ? "Your profile is looking good! Add more details to reach 100%."
                        : "Your profile is complete! Great job!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="edit-profile-tab">
            <h2 className="tab-title">Edit Your Profile</h2>
            <ProfileEditForm 
              candidate={candidate} 
              onSave={handleSaveProfile} 
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
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-tab">
            <h2>Your Applications</h2>
            <div className="applications-list">
              {appsLoading && (
                <div className="application-item">
                  <div className="application-info">
                    <h3>Loading applications...</h3>
                  </div>
                </div>
              )}

              {!appsLoading && appsError && (
                <div className="application-item">
                  <div className="application-info">
                    <h3>Could not load applications</h3>
                    <p style={{ color: '#F44336' }}>{appsError}</p>
                  </div>
                </div>
              )}

              {!appsLoading && !appsError && applications.length === 0 && (
                <div className="application-item">
                  <div className="application-info">
                    <h3>No applications yet</h3>
                    <p>Start applying to jobs to see them here.</p>
                  </div>
                </div>
              )}

              {!appsLoading && !appsError && applications.map((app) => (
                <div className="application-item" key={app.id || `${app.jobId}-${app.appliedAt}`}>
                  <div className="application-info">
                    <h3>{app.jobTitle || app.title || 'Job'}</h3>
                    <p>{app.companyName || app.company || 'Company'}</p>
                    <span className="application-date">
                      Applied on: {new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge ${statusToBadgeClass(app.status)}`}>
                      {String(app.status || 'In Review').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Edit Form Component
const ProfileEditForm = ({ candidate, onSave }) => {
  const [formData, setFormData] = useState({
    name: candidate?.name || "",
    email: candidate?.email || "",
    phoneNumber: candidate?.phoneNumber || "",
    location: candidate?.location || "",
    title: candidate?.title || "",
    headline: candidate?.headline || "",
    experience: candidate?.experience || {
      isExperienced: false,
      role: "",
      company: "",
      yearsOfExperience: 0
    },
    education: candidate?.education || {
      degree: "",
      institution: "",
      graduationYear: null
    },
    skills: candidate?.skills || [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        [name]: value
      }
    }));
  };

  const addSkill = async () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      try {
        const updatedSkills = await candidateService.addSkill(newSkill.trim());
        setFormData(prev => ({
          ...prev,
          skills: updatedSkills,
        }));
        setNewSkill("");
      } catch (error) {
        console.error("Error adding skill:", error);
        alert("Error adding skill. Please try again.");
      }
    }
  };

  const removeSkill = async (skillToRemove) => {
    try {
      const updatedSkills = await candidateService.removeSkill(skillToRemove);
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills,
      }));
    } catch (error) {
      console.error("Error removing skill:", error);
      alert("Error removing skill. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            value={formData.phoneNumber} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="form-group">
          <label>Professional Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
          />
        </div>
        <div className="form-group">
          <label>Professional Bio (Headline)</label>
          <textarea 
            name="headline" 
            value={formData.headline} 
            onChange={handleInputChange} 
            rows="4" 
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Skills</h3>
        <div className="skills-input">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          />
          <button type="button" onClick={addSkill}>Add</button>
        </div>
        <div className="skills-list">
          {formData.skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)}>×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>Experience</h3>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isExperienced"
              checked={formData.experience.isExperienced || false}
              onChange={handleExperienceChange}
            />
            I have work experience
          </label>
        </div>
        {formData.experience.isExperienced && (
          <>
            <div className="form-group">
              <label>Role/Position</label>
              <input
                type="text"
                name="role"
                value={formData.experience.role || ""}
                onChange={handleExperienceChange}
                placeholder="e.g., Software Developer"
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                name="company"
                value={formData.experience.company || ""}
                onChange={handleExperienceChange}
                placeholder="Company name"
              />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.experience.yearsOfExperience || 0}
                onChange={handleExperienceChange}
                min="0"
              />
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <h3>Education</h3>
        <div className="form-group">
          <label>Degree</label>
          <input
            type="text"
            name="degree"
            value={formData.education.degree || ""}
            onChange={handleEducationChange}
            placeholder="e.g., Bachelor of Science"
          />
        </div>
        <div className="form-group">
          <label>Institution</label>
          <input
            type="text"
            name="institution"
            value={formData.education.institution || ""}
            onChange={handleEducationChange}
            placeholder="University or school name"
          />
        </div>
        <div className="form-group">
          <label>Graduation Year</label>
          <input
            type="number"
            name="graduationYear"
            value={formData.education.graduationYear || ""}
            onChange={handleEducationChange}
            placeholder="e.g., 2023"
            min="1900"
            max="2030"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
};

export default CandidateProfilePage;