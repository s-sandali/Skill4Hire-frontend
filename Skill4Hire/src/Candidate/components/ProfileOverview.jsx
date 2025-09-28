import { Link } from "react-router-dom"
import { FiMapPin, FiMail, FiPhone, FiEdit3, FiDownload, FiUser } from "react-icons/fi"
import { useState, useEffect, useCallback } from "react"
import "../base.css"
import "../buttons.css"
import "./ProfileOverview.css"

export default function ProfileOverview({ candidate }) {
  const [completeness, setCompleteness] = useState(0)

  const calculateCompleteness = (candidate) => {
    if (!candidate) return 0
    
    const fields = [
      'name', 'email', 'phone', 'location', 'title', 'bio',
      'experience', 'education', 'skills', 'linkedin', 'github', 'portfolio'
    ]
    
    const filledFields = fields.filter(field => {
      const value = candidate[field]
      
      // Handle different field types
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        // Check if object has any non-empty values
        return Object.values(value).some(val => 
          val !== null && val !== undefined && val.toString().trim() !== ''
        )
      }
      return value && value.toString().trim() !== ''
    }).length
    
    return Math.round((filledFields / fields.length) * 100)
  }

  const fetchProfileCompleteness = useCallback(async () => {
    try {
      const { candidateService } = await import("../../services/candidateService")
      const completenessData = await candidateService.checkProfileCompleteness()
      setCompleteness(completenessData.completeness || 0)
    } catch (error) {
      console.error("Error fetching profile completeness:", error)
      // Fallback to calculated completeness
      setCompleteness(calculateCompleteness(candidate))
    }
  }, [candidate])

  useEffect(() => {
    if (candidate) {
      fetchProfileCompleteness()
    }
  }, [candidate, fetchProfileCompleteness])

  // Format experience for display
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

  // Format education for display
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
      console.log("No profile picture path provided");
      return null;
    }
    
    console.log("Profile picture path:", profilePicturePath);
    
    // If it's already a full URL, return as is
    if (profilePicturePath.startsWith('http')) {
      return profilePicturePath;
    }
    
    // Use the static resource URL
    if (profilePicturePath.includes('/')) {
      return `/uploads/${profilePicturePath}`;
    } else {
      // Default to profile-pictures subdirectory
      return `/uploads/profile-pictures/${profilePicturePath}`;
    }
  };

  // Get resume download URL
  const getResumeUrl = (resumePath) => {
    if (!resumePath) {
      console.log("No resume path provided");
      return null;
    }
    
    console.log("Resume path:", resumePath);
    
    // If it's already a full URL, return as is
    if (resumePath.startsWith('http')) {
      return resumePath;
    }
    
    // Use the static resource URL
    if (resumePath.includes('/')) {
      return `/uploads/${resumePath}`;
    } else {
      // Default to resumes subdirectory
      return `/uploads/resumes/${resumePath}`;
    }
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

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = resumeUrl;
    
    // Extract the original file name or use a default name
    const fileName = candidate.resumePath.split('/').pop() || 'resume.pdf';
    link.download = fileName;
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Debug: Log the candidate data to see what we're receiving
  console.log("ProfileOverview received candidate data:", candidate);

  // Use candidate data if available, otherwise show mock data
  const profileData = candidate ? {
    name: candidate.name || "First Last",
    title: candidate.title || "Professional",
    location: candidate.location || "Location not specified",
    email: candidate.email || "email@example.com",
    phone: candidate.phone || candidate.phoneNumber || "Phone not provided",
    bio: candidate.bio || candidate.headline || "Complete your profile to tell employers about yourself.",
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

  // Debug: Log the final profile data
  console.log("ProfileOverview final profileData:", profileData);

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
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("Profile picture loaded successfully:", profilePictureUrl);
                }}
              />
            ) : (
              <div className="profile-avatar-large placeholder">
                <FiUser size={40} />
              </div>
            )}
           
            <div className="profile-completeness">
              <span className="completeness-text">{profileData.completeness}%</span>
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
                <p>Resume: {profileData.resumePath.split('/').pop()}</p>
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