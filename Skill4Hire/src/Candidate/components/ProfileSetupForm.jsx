"use client"

import { useState } from "react"
import FileUpload from "./FileUpload"
import "../base.css"
import "../buttons.css"
import "./ProfileSetupForm.css"

export default function ProfileSetupForm({ candidate, onUpdate }) {
  const [formData, setFormData] = useState({
    firstName: candidate?.firstName || "",
    lastName: candidate?.lastName || "",
    email: candidate?.email || "",
    phone: candidate?.phone || "",
    location: candidate?.location || "",
    title: candidate?.title || "",
    bio: candidate?.bio || "",
    experience: candidate?.experience || "",
    education: candidate?.education || "",
    skills: candidate?.skills || [],
    linkedin: candidate?.linkedin || "",
    github: candidate?.github || "",
    portfolio: candidate?.portfolio || "",
  })

  const [newSkill, setNewSkill] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [profilePictureFile, setProfilePictureFile] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addSkill = async () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      try {
        const { candidateService } = await import("../../services/candidateService")
        const updatedSkills = await candidateService.addSkill(newSkill.trim())
        setFormData((prev) => ({
          ...prev,
          skills: updatedSkills,
        }))
        setNewSkill("")
      } catch (error) {
        console.error("Error adding skill:", error)
        alert("Error adding skill. Please try again.")
      }
    }
  }

  const removeSkill = async (skillToRemove) => {
    try {
      const { candidateService } = await import("../../services/candidateService")
      const updatedSkills = await candidateService.removeSkill(skillToRemove)
      setFormData((prev) => ({
        ...prev,
        skills: updatedSkills,
      }))
    } catch (error) {
      console.error("Error removing skill:", error)
      alert("Error removing skill. Please try again.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Import candidateService here to avoid circular dependency
      const { candidateService } = await import("../../services/candidateService")
      
      // Update profile data
      await candidateService.updateProfile(formData)
      
      // Upload files if selected
      if (resumeFile) {
        await candidateService.uploadResume(resumeFile)
      }
      
      if (profilePictureFile) {
        await candidateService.uploadProfilePicture(profilePictureFile)
      }
      
      if (onUpdate) onUpdate()
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="section-title">Basic Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              placeholder="City, State/Country"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Professional Information</h3>
        <div className="form-group">
          <label className="form-label">Professional Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g., Software Engineer, Marketing Manager"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Professional Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Tell employers about yourself, your experience, and what you're looking for..."
            rows="4"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Skills</h3>
        <div className="skills-input-group">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="form-input"
            placeholder="Add a skill"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          />
          <button type="button" onClick={addSkill} className="btn btn-secondary">
            Add
          </button>
        </div>
        <div className="skills-list">
          {formData.skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="skill-remove">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Experience & Education</h3>
        <div className="form-group">
          <label className="form-label">Work Experience</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Describe your work experience, including company names, positions, and key achievements..."
            rows="4"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Education</label>
          <textarea
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="List your educational background, degrees, certifications..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">File Uploads</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Resume Upload</label>
            <FileUpload
              onFileSelect={setResumeFile}
              accept=".pdf,.doc,.docx"
              maxSize={5 * 1024 * 1024} // 5MB
              label="Upload Resume"
              description="PDF, DOC, or DOCX files only (max 5MB)"
            />
            {resumeFile && (
              <p className="file-selected">Selected: {resumeFile.name}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Profile Picture</label>
            <FileUpload
              onFileSelect={setProfilePictureFile}
              accept="image/*"
              maxSize={2 * 1024 * 1024} // 2MB
              label="Upload Profile Picture"
              description="JPG, PNG, or GIF files only (max 2MB)"
            />
            {profilePictureFile && (
              <p className="file-selected">Selected: {profilePictureFile.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Links & Portfolio</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div className="form-group">
            <label className="form-label">GitHub Profile</label>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://github.com/yourusername"
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Portfolio Website</label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-large" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  )
}
