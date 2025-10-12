import { Link } from "react-router-dom"
import { FiMapPin, FiMail, FiPhone, FiEdit3, FiDownload, FiUser, FiLinkedin, FiGithub, FiGlobe, FiRefreshCw } from "react-icons/fi"
import { useState, useEffect, useCallback } from "react"
import "../base.css"
import "../buttons.css"
import "./ProfileOverview.css"

export default function ProfileOverview({ candidate, onRefresh }) {
  const [completeness, setCompleteness] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProfileCompleteness = useCallback(async () => {
    try {
      const { candidateService } = await import("../../services/candidateService.jsx")
      const completenessData = await candidateService.checkProfileCompleteness()
      setCompleteness(completenessData.completeness || 0)
    } catch (error) {
      console.error("Error fetching profile completeness:", error)
      setCompleteness(calculateCompleteness(candidate))
    }
  }, [candidate])

  // Update the fallback calculation to match backend fields
  const calculateCompleteness = (candidate) => {
    if (!candidate) return 0
    
    const fields = [
      'name', 'email', 'phoneNumber', 'location', 'title', 'headline',
      'experience', 'education', 'skills', 'resumePath', 'profilePicturePath'
    ]
    
    const filledFields = fields.filter(field => {
      const value = candidate[field]
      
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(val => 
          val !== null && val !== undefined && val.toString().trim() !== ''
        )
      }
      return value && value.toString().trim() !== ''
    }).length
    
    return Math.round((filledFields / fields.length) * 100)
  }

  const refreshProfile = async () => {
    if (onRefresh) {
      setRefreshing(true)
      try {
        await onRefresh()
        // Also refresh completeness
        await fetchProfileCompleteness()
      } catch (error) {
        console.error("Error refreshing profile:", error)
      } finally {
        setRefreshing(false)
      }
    }
  }

  useEffect(() => {
    if (candidate) {
      fetchProfileCompleteness()
    }
  }, [candidate, fetchProfileCompleteness])

  // Format experience for display - match backend structure
  const formatExperience = (experience) => {
    if (!experience) return "No experience listed yet."
    
    const { isExperienced, role, company, yearsOfExperience } = experience
    
    if (!isExperienced) return "No experience listed yet."
    
    let experienceText = ""
    if (role) experienceText += role
    if (company) experienceText += experienceText ? ` at ${company}` : company
    if (yearsOfExperience) experienceText += experienceText ? ` (${yearsOfExperience} years)` : `${yearsOfExperience} years experience`
    
    return experienceText || "Experience details available"
  }

  // Format education for display - match backend structure
  const formatEducation = (education) => {
    if (!education) return "No education listed yet."
    
    const { degree, institution, graduationYear } = education
    
    let educationText = ""
    if (degree) educationText += degree
    if (institution) educationText += educationText ? ` from ${institution}` : institution
    if (graduationYear) educationText += educationText ? `, ${graduationYear}` : `Graduated ${graduationYear}`
    
    return educationText || "Education details available"
  }

  // Get profile picture URL
  const getProfilePictureUrl = (profilePicturePath) => {
    if (!profilePicturePath) {
      return null;
    }
    
    // If it's already a full URL, return as is
    if (profilePicturePath.startsWith('http')) {
      return profilePicturePath;
    }
    
    // Use the backend URL structure
    return `http://localhost:8080/uploads/profile-pictures/${profilePicturePath}`;
  };

  // Get resume download URL
  const getResumeUrl = (resumePath) => {
    if (!resumePath) {
      return null;
    }
    
    // If it's already a full URL, return as is
    if (resumePath.startsWith('http')) {
      return resumePath;
    }
    
    // Use the backend URL structure
    return `http://localhost:8080/uploads/resumes/${resumePath}`;
  };

  // Handle resume download
  const handleDownloadResume = () => {
    if (!candidate?.resumePath) {
      alert("No resume available to download");
      return;
    }

    const resumeUrl = getResumeUrl(candidate.resumePath);
    if (!resumeUrl) {
      alert("Resume URL is not available");
      return;
    }

    // Open in new tab for download
    window.open(resumeUrl, '_blank');
  };

  // Use candidate data with backend field names as primary, with fallbacks
  const profileData = candidate ? {
    name: candidate.name || "First Last",
    title: candidate.title || "Professional",
    location: candidate.location || "Location not specified",
    email: candidate.email || "email@example.com",
    phone: candidate.phoneNumber || candidate.phone || "Phone not provided",
    bio: candidate.headline || candidate.bio || "Complete your profile to tell employers about yourself.",
    skills: candidate.skills || [],
    experience: candidate.experience,
    education: candidate.education,
    linkedin: candidate.linkedin || "",
    github: candidate.github || "",
    portfolio: candidate.portfolio || "",
    completeness: candidate.profileCompleteness || completeness,
    resumePath: candidate.resumePath,
    profilePicturePath: candidate.profilePicturePath
  } : {
    name: "First Last", 
    title: "Professional",
    location: "Location not specified",
    email: "email@example.com",
    phone: "Phone not provided",
    bio: "Complete your profile to tell employers about yourself.",
    skills: [],
    experience: null,
    education: null,
    linkedin: "",
    github: "",
    portfolio: "",
    completeness: completeness,
    resumePath: null,
    profilePicturePath: null
  }

  // Get the actual profile picture URL
  const profilePictureUrl = getProfilePictureUrl(profileData.profilePicturePath);

  return (
    <div className="profile-overview">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            {profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
                alt="Profile" 
                className="profile-avatar-large"
                onError={(e) => {
                  console.error("Failed to load profile picture:", profilePictureUrl);
                  e.target.src = "/professional-headshot.png";
                }}
              />
            ) : (
              <div className="profile-avatar-large placeholder">
                <FiUser size={40} />
              </div>
            )}
           
            <div className="profile-completeness">
              <div className="completeness-circle">
                <span className="completeness-text">{profileData.completeness}%</span>
              </div>
             
            </div>
          </div>

          <div className="profile-basic-info">
            <h1 className="profile-name">
              {profileData.name}
            </h1>
            <h2 className="profile-title">{profileData.title}</h2>
            <p className="profile-location">
              <FiMapPin className="profile-icon" size={16} />
              {profileData.location}
            </p>

            <div className="profile-contact">
              <div className="contact-item">
                <FiMail className="profile-icon" size={16} />
                {profileData.email}
              </div>
              <div className="contact-item">
                <FiPhone className="profile-icon" size={16} />
                {profileData.phone}
              </div>
            </div>

            {/* Social Links Section */}
            {(profileData.linkedin || profileData.github || profileData.portfolio) && (
              <div className="profile-links">
                {profileData.linkedin && (
                  <a href={profileData.linkedin} className="profile-link" target="_blank" rel="noopener noreferrer">
                    <FiLinkedin size={16} />
                    LinkedIn
                  </a>
                )}
                {profileData.github && (
                  <a href={profileData.github} className="profile-link" target="_blank" rel="noopener noreferrer">
                    <FiGithub size={16} />
                    GitHub
                  </a>
                )}
                {profileData.portfolio && (
                  <a href={profileData.portfolio} className="profile-link" target="_blank" rel="noopener noreferrer">
                    <FiGlobe size={16} />
                    Portfolio
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/candidate-setup" className="btn btn-primary">
            <FiEdit3 size={16} />
            Edit Profile
          </Link>
          <button 
            className="btn btn-secondary"
            onClick={refreshProfile}
            disabled={refreshing}
          >
            <FiRefreshCw size={16} className={refreshing ? "spinning" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button 
            className={`btn ${profileData.resumePath ? 'btn-secondary' : 'btn-disabled'}`} 
            onClick={handleDownloadResume}
            disabled={!profileData.resumePath}
          >
            <FiDownload size={16} />
            {profileData.resumePath ? "Download Resume" : "No Resume"}
          </button>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <h3 className="section-title">About</h3>
          <div className="section-content">
            <p className="profile-bio">{profileData.bio}</p>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Skills</h3>
          <div className="section-content">
            <div className="skills-grid">
              {profileData.skills && profileData.skills.length > 0 ? profileData.skills.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill}
                </span>
              )) : <p>No skills listed</p>}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Experience</h3>
          <div className="section-content">
            <div className="experience-text">
              {formatExperience(profileData.experience)}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Education</h3>
          <div className="section-content">
            <div className="education-text">
              {formatEducation(profileData.education)}
            </div>
          </div>
        </div>

        {/* Add Resume Section */}
        <div className="profile-section">
          <h3 className="section-title">Resume</h3>
          <div className="section-content">
            {profileData.resumePath ? (
              <div className="resume-info">
                <p>Resume is available for download</p>
                <button 
                  className="btn btn-outline small" 
                  onClick={handleDownloadResume}
                >
                  <FiDownload size={14} />
                  Download Resume
                </button>
              </div>
            ) : (
              <p>No resume uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
