import { Link } from "react-router-dom"
import { FiMapPin, FiMail, FiPhone, FiEdit3, FiDownload } from "react-icons/fi"
import { useState, useEffect, useCallback } from "react"
import "../base.css"
import "../buttons.css"
import "./ProfileOverview.css"

export default function ProfileOverview({ candidate }) {
  const [completeness, setCompleteness] = useState(0)

  const fetchProfileCompleteness = useCallback(async () => {
    try {
      const { candidateService } = await import("../../services/candidateService")
      const completenessData = await candidateService.checkProfileCompleteness()
      // Backend returns { completeness: number, message: string }
      setCompleteness(completenessData.completeness || 0)
    } catch (error) {
      console.error("Error fetching profile completeness:", error)
      // Fallback to calculated completeness
      setCompleteness(calculateCompleteness(candidate))
    }
  }, [candidate])

  // Update the fallback calculation to match backend fields
  const calculateCompleteness = (candidate) => {
    if (!candidate) return 0
    
    const fields = [
      'name', 'email', 'phoneNumber', 'location', 'title', 'headline',
      'skills', 'education', 'experience', 'resumePath', 'profilePicturePath'
    ]
    
    const filledFields = fields.filter(field => {
      const value = candidate[field]
      
      // Handle different field types
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        // Check if embedded object has content
        return Object.values(value).some(val => 
          val !== null && val !== undefined && val.toString().trim() !== ''
        )
      }
      return value && value.toString().trim() !== ''
    }).length
    
    return Math.round((filledFields / fields.length) * 100)
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

  // Use candidate data with backend field names
  const profileData = candidate ? {
    name: candidate.name || "First Last",
    title: candidate.title || "Professional",
    location: candidate.location || "Location not specified",
    email: candidate.email || "email@example.com",
    phone: candidate.phoneNumber || "Phone not provided", // Use phoneNumber from backend
    bio: candidate.headline || "Complete your profile to tell employers about yourself.", // headline from backend
    skills: candidate.skills || [],
    experience: candidate.experience,
    education: candidate.education,
    resumePath: candidate.resumePath,
    profilePicturePath: candidate.profilePicturePath,
    completeness: candidate.profileCompleteness || completeness,
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
    resumePath: null,
    profilePicturePath: null,
    completeness: completeness,
  }

  // Add resume download functionality
  const handleDownloadResume = () => {
    if (profileData.resumePath) {
      // Construct the full URL to the resume file
      const resumeUrl = `http://localhost:8080/uploads/resumes/${profileData.resumePath}`
      window.open(resumeUrl, '_blank')
    } else {
      alert('No resume available for download')
    }
  }

  return (
    <div className="profile-overview">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            {/* Use profile picture from backend if available */}
            <img 
              src={profileData.profilePicturePath 
                ? `http://localhost:8080/uploads/profile-pictures/${profileData.profilePicturePath}`
                : "/professional-headshot.png"
              } 
              alt="Profile" 
              className="profile-avatar-large" 
            />
            <div className="profile-completeness">
              <div className="completeness-circle">
                <span className="completeness-text">{profileData.completeness}%</span>
              </div>
              <div className="completeness-label">Complete</div>
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

            {/* Remove social links since they're not in backend */}
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/candidate-setup" className="btn btn-primary">
            <FiEdit3 size={16} />
            Edit Profile
          </Link>
          <button className="btn btn-secondary" onClick={handleDownloadResume}>
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

        {/* Add resume status section */}
        {profileData.resumePath && (
          <div className="profile-section">
            <h3 className="section-title">Resume</h3>
            <div className="section-content">
              <p>Resume is available for download</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}