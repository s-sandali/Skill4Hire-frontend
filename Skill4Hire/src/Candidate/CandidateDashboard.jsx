"use client"

import { useState, useEffect } from "react"
import { candidateService } from "../../services/candidateService"
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

  return (
    <div className="profile-overview">
      <div className="profile-header">
        <div className="profile-image">
          {candidate.profilePicture ? (
            <img src={candidate.profilePicture || "/placeholder.svg"} alt="Profile" />
          ) : (
            <div className="profile-placeholder">{candidate.firstName?.[0]}</div>
          )}
        </div>
        <div className="profile-info">
          <h1>
            {candidate.firstName} {candidate.lastName}
          </h1>
          <p className="profile-title">{candidate.jobTitle || "Job Seeker"}</p>
          <p className="profile-location">{candidate.location}</p>
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
          <p>{candidate.bio || "No bio provided"}</p>
        </div>

        <div className="section">
          <h3>Skills</h3>
          <div className="skills-list">
            {candidate.skills?.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>Experience</h3>
          <p>{candidate.experience || "No experience listed"}</p>
        </div>

        <div className="section">
          <h3>Education</h3>
          <p>{candidate.education || "No education listed"}</p>
        </div>
      </div>
    </div>
  )
}

const EditProfile = ({ candidate, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: candidate?.firstName || "",
    lastName: candidate?.lastName || "",
    email: candidate?.email || "",
    phone: candidate?.phone || "",
    location: candidate?.location || "",
    jobTitle: candidate?.jobTitle || "",
    bio: candidate?.bio || "",
    experience: candidate?.experience || "",
    education: candidate?.education || "",
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

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
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
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>Job Title</label>
          <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" />
        </div>

        <div className="form-group">
          <label>Experience</label>
          <textarea name="experience" value={formData.experience} onChange={handleInputChange} rows="4" />
        </div>

        <div className="form-group">
          <label>Education</label>
          <textarea name="education" value={formData.education} onChange={handleInputChange} rows="4" />
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
        {sampleApplications.map((application) => (
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

