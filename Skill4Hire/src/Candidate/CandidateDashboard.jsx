"use client"

import { useState, useEffect } from "react"
import { candidateService } from "../../services/candidateService"
import { applicationsService } from "../../services/applicationsService"
import "./base.css"
import "./buttons.css"
import "./dashboard.css"

const CandidateDashboard = () => {
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchCandidateProfile()
  }, [])

  const fetchCandidateProfile = async () => {
    try {
      const profile = await candidateService.getProfile()
      setCandidate(profile)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>
  }

  return (
    <div className="candidate-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Candidate Portal</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Profile Overview
          </button>
          <button className={`nav-item ${activeTab === "edit" ? "active" : ""}`} onClick={() => setActiveTab("edit")}>
            Edit Profile
          </button>
          <button
            className={`nav-item ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            Application Tracking
          </button>
          <button
            className={`nav-item ${activeTab === "recommendations" ? "active" : ""}`}
            onClick={() => setActiveTab("recommendations")}
          >
            Job Recommendations
          </button>
          <button
            className={`nav-item ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </nav>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && <ProfileOverview candidate={candidate} />}
        {activeTab === "edit" && <EditProfile candidate={candidate} onUpdate={fetchCandidateProfile} />}
        {activeTab === "applications" && <ApplicationTracking />}
        {activeTab === "recommendations" && <JobRecommendations />}
        {activeTab === "notifications" && <Notifications />}
      </div>
    </div>
  )
}

const ProfileOverview = ({ candidate }) => {
  if (!candidate) {
    return <div className="no-profile">Please complete your profile setup.</div>
  }

  // Format experience for display using backend DTO structure
  const formatExperience = (experience) => {
    if (!experience || !experience.isExperienced) return "No experience listed yet."
    
    const { role, company, yearsOfExperience } = experience
    
    let experienceText = ""
    if (role) experienceText += role
    if (company) experienceText += experienceText ? ` at ${company}` : company
    if (yearsOfExperience) experienceText += experienceText ? ` (${yearsOfExperience} years)` : `${yearsOfExperience} years experience`
    
    return experienceText || "Experience details available"
  }

  // Format education for display using backend DTO structure
  const formatEducation = (education) => {
    if (!education) return "No education listed yet."
    
    const { degree, institution, graduationYear } = education
    
    let educationText = ""
    if (degree) educationText += degree
    if (institution) educationText += educationText ? ` from ${institution}` : institution
    if (graduationYear) educationText += educationText ? `, ${graduationYear}` : `Graduated ${graduationYear}`
    
    return educationText || "Education details available"
  }

  return (
    <div className="profile-overview">
      <div className="profile-header">
        <div className="profile-image">
          {candidate.profilePicturePath ? (
            <img src={candidate.profilePicturePath || "/placeholder.svg"} alt="Profile" />
          ) : (
            <div className="profile-placeholder">{candidate.name?.[0] || "U"}</div>
          )}
        </div>
        <div className="profile-info">
          <h1>{candidate.name || "Candidate Name"}</h1>
          <p className="profile-title">{candidate.title || "Job Seeker"}</p>
          <p className="profile-location">{candidate.location || "Location not specified"}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>Profile Completeness</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${candidate.profileCompleteness || 0}%` }}></div>
          </div>
          <span>{candidate.profileCompleteness || 0}%</span>
        </div>
      </div>

      <div className="profile-sections">
        <div className="section">
          <h3>About</h3>
<<<<<<< HEAD
          <p>{candidate.headline || candidate.bio || "No bio provided"}</p>
=======
          <p>{candidate.headline || "No bio provided"}</p>
>>>>>>> 75012195c6be97b8c92b8ced2f7cb10cacfdc7e0
        </div>

        <div className="section">
          <h3>Skills</h3>
          <div className="skills-list">
            {candidate.skills?.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            )) || <p>No skills listed</p>}
          </div>
        </div>

        <div className="section">
          <h3>Experience</h3>
          <p>{formatExperience(candidate.experience)}</p>
        </div>

        <div className="section">
          <h3>Education</h3>
          <p>{formatEducation(candidate.education)}</p>
        </div>
      </div>
    </div>
  )
}

const EditProfile = ({ candidate, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: candidate?.name || "",
    email: candidate?.email || "",
    phoneNumber: candidate?.phoneNumber || "", // Changed from phone
    location: candidate?.location || "",
    title: candidate?.title || "",
    headline: candidate?.headline || candidate?.bio || "", // Map bio to headline
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
  })
  const [newSkill, setNewSkill] = useState("")
  const [saving, setSaving] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        [name]: type === 'checkbox' ? checked : value
      }
    }))
  }

  const handleEducationChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        [name]: value
      }
    }))
  }

  const addSkill = async () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      try {
        const updatedSkills = await candidateService.addSkill(newSkill.trim())
        setFormData({
          ...formData,
          skills: updatedSkills,
        })
        setNewSkill("")
      } catch (error) {
        console.error("Error adding skill:", error)
        alert("Error adding skill. Please try again.")
      }
    }
  }

  const removeSkill = async (skillToRemove) => {
    try {
      const updatedSkills = await candidateService.removeSkill(skillToRemove)
      setFormData({
        ...formData,
        skills: updatedSkills,
      })
    } catch (error) {
      console.error("Error removing skill:", error)
      alert("Error removing skill. Please try again.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await candidateService.updateProfile(formData)
      onUpdate()
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>Job Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>Professional Bio (Headline)</label>
          <textarea name="headline" value={formData.headline} onChange={handleInputChange} rows="4" />
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

        <div className="form-group">
          <label>Skills</label>
          <div className="skills-input">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <button type="button" onClick={addSkill}>
              Add
            </button>
          </div>
          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="save-button" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}

const ApplicationTracking = () => {
  const sampleApplications = [
    {
      id: 1,
      role: "Frontend Developer",
      company: "TechNova Labs",
      location: "Remote - North America",
      appliedOn: "Sep 12, 2025",
      status: "Applied",
      statusDetail: "Recruiter is reviewing your profile. We'll update you within 3 business days.",
    },
    {
      id: 2,
      role: "UI/UX Designer",
      company: "BrightPixel Studio",
      location: "Austin, TX",
      appliedOn: "Aug 29, 2025",
      status: "Shortlisted",
      statusDetail: "You have been shortlisted. The hiring manager will reach out to schedule an interview.",
    },
    {
      id: 3,
      role: "Full Stack Engineer",
      company: "CloudScale Inc.",
      location: "New York, NY",
      appliedOn: "Aug 18, 2025",
      status: "Rejected",
      statusDetail: "Thank you for applying. The team moved forward with another candidate at this time.",
    },
  ]

  const [applications, setApplications] = useState(sampleApplications)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await applicationsService.listForCurrent()
        if (!mounted) return
        const mapped = (Array.isArray(data) ? data : []).map((a) => ({
          id: a.id,
          role: a.jobTitle || a.jobDescription || 'Job Application',
          company: a.companyName || '—',
          location: a.jobLocation || a.jobType || '',
          appliedOn: a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '-',
          status: (() => {
            const s = String(a.status || '').toUpperCase()
            if (s === 'APPLIED') return 'Applied'
            if (s === 'SHORTLISTED') return 'Shortlisted'
            if (s === 'REJECTED') return 'Rejected'
            return a.status || 'Applied'
          })(),
          statusDetail: a.jobDescription || '',
        }))
        if (mapped.length) setApplications(mapped)
      } catch (e) {
        // Keep samples on error; optionally log
        console.warn('Failed to load applications:', e?.message || e)
      }
    })()
    return () => { mounted = false }
  }, [])

  const statusClassMap = {
    Applied: "status-applied",
    Shortlisted: "status-shortlisted",
    Rejected: "status-rejected",
  }

  return (
    <div className="application-tracking">
      <h2>Application Tracking</h2>
      <p className="section-subtitle">Sample view showing how your job applications will appear once tracking is live.</p>
      <div className="application-grid">
        {applications.map((application) => (
          <div key={application.id} className="application-card">
            <div className="application-header">
              <div>
                <h3>{application.role}</h3>
                <p className="application-company">{application.company}</p>
              </div>
              <span className={`status-pill ${statusClassMap[application.status] || "status-default"}`}>
                {application.status}
              </span>
            </div>
            <div className="application-meta">
              <span>{application.location}</span>
              <span>Applied on {application.appliedOn}</span>
            </div>
            <p className="status-detail">{application.statusDetail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
const JobRecommendations = () => {
  return (
    <div className="job-recommendations">
      <h2>Job Recommendations</h2>
      <p className="coming-soon">This feature is coming soon!</p>
    </div>
  )
}

const Notifications = () => {
  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <p className="coming-soon">This feature is coming soon!</p>
    </div>
  )
}

export default CandidateDashboard

