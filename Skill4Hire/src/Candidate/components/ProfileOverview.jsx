import { Link } from "react-router-dom"
import { FiMapPin, FiMail, FiPhone, FiEdit3, FiDownload } from "react-icons/fi"
import "../base.css"
import "../buttons.css"
import "./ProfileOverview.css"

export default function ProfileOverview({ candidate }) {
    // Use candidate data if available, otherwise show mock data
    const profileData = candidate ? {
      firstName: candidate.firstName || "First",
      lastName: candidate.lastName || "Last",
      title: candidate.title || "Professional",
      location: candidate.location || "Location not specified",
      email: candidate.email || "email@example.com",
      phone: candidate.phone || "Phone not provided",
      bio: candidate.bio || "Complete your profile to tell employers about yourself.",
      skills: candidate.skills || [],
      experience: candidate.experience || "No experience listed yet.",
      education: candidate.education || "No education listed yet.",
      linkedin: candidate.linkedin || "",
      github: candidate.github || "",
      portfolio: candidate.portfolio || "",
      completeness: candidate.completeness || 0,
    } : {
      firstName: "First",
      lastName: "Last", 
      title: "Professional",
      location: "Location not specified",
      email: "email@example.com",
      phone: "Phone not provided",
      bio: "Complete your profile to tell employers about yourself.",
      skills: [],
      experience: "No experience listed yet.",
      education: "No education listed yet.",
      linkedin: "",
      github: "",
      portfolio: "",
      completeness: 0,
    }
  
    return (
      <div className="profile-overview">
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <img src="/professional-headshot.png" alt="Profile" className="profile-avatar-large" />
              <div className="profile-completeness">
                <div className="completeness-circle">
                  <span className="completeness-text">{profileData.completeness}%</span>
                </div>
                <div className="completeness-label">Complete</div>
              </div>
            </div>
  
            <div className="profile-basic-info">
              <h1 className="profile-name">
                {profileData.firstName} {profileData.lastName}
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
  
              <div className="profile-links">
                {profileData.linkedin && (
                  <a href={profileData.linkedin} className="profile-link" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                )}
                {profileData.github && (
                  <a href={profileData.github} className="profile-link" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
                {profileData.portfolio && (
                  <a href={profileData.portfolio} className="profile-link" target="_blank" rel="noopener noreferrer">
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
  
          <div className="profile-actions">
            <Link to="/candidate-setup" className="btn btn-primary">
              <FiEdit3 size={16} />
              Edit Profile
            </Link>
            <button className="btn btn-secondary">
              <FiDownload size={16} />
              Download Resume
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
                {profileData.experience ? profileData.experience.split("\n").map((line, index) => (
                  <div key={index} className={line.startsWith("•") ? "experience-bullet" : "experience-line"}>
                    {line}
                  </div>
                )) : <p>No experience listed</p>}
              </div>
            </div>
          </div>
  
          <div className="profile-section">
            <h3 className="section-title">Education</h3>
            <div className="section-content">
              <div className="education-text">
                {profileData.education ? profileData.education.split("\n").map((line, index) => (
                  <div key={index} className="education-line">
                    {line}
                  </div>
                )) : <p>No education listed</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  