"use client"

import { useState } from "react"
import FileUpload from "./FileUpload"
import "../base.css"
import "../buttons.css"
import "./ProfileSetupForm.css"

export default function ProfileSetupForm({ candidate, onUpdate }) {
  const [formData, setFormData] = useState({
    name: candidate?.name || "",
    email: candidate?.email || "",
    phoneNumber: candidate?.phoneNumber || "",
    location: candidate?.location || "",
    title: candidate?.title || "",
    headline: candidate?.headline || candidate?.bio || "",
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
    jobPreferences: candidate?.jobPreferences || {
      jobType: "",
      expectedSalary: "",
      willingToRelocate: false
    }
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

  const handleJobPreferencesChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        [name]: type === 'checkbox' ? checked : value
      }
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
      const { candidateService } = await import("../../services/candidateService")
      
      // Prepare data for backend with proper field mapping
      const backendData = {
        ...formData,
        // Ensure nested objects are properly structured
        experience: formData.experience,
        education: formData.education,
        jobPreferences: formData.jobPreferences
      }
      
      await candidateService.updateProfile(backendData)
      
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
          <div className="form-group form-group-full">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="Enter your full name"
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
            <input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleInputChange} 
              className="form-input" 
            />
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
          <label className="form-label">Professional Bio (Headline)</label>
          <textarea
            name="headline"
            value={formData.headline}
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
        <h3 className="section-title">Experience</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
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
                <label className="form-label">Role/Position</label>
                <input
                  type="text"
                  name="role"
                  value={formData.experience.role || ""}
                  onChange={handleExperienceChange}
                  className="form-input"
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.experience.company || ""}
                  onChange={handleExperienceChange}
                  className="form-input"
                  placeholder="Company name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.experience.yearsOfExperience || 0}
                  onChange={handleExperienceChange}
                  className="form-input"
                  min="0"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Education</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Degree</label>
            <input
              type="text"
              name="degree"
              value={formData.education.degree || ""}
              onChange={handleEducationChange}
              className="form-input"
              placeholder="e.g., Bachelor of Science"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Institution</label>
            <input
              type="text"
              name="institution"
              value={formData.education.institution || ""}
              onChange={handleEducationChange}
              className="form-input"
              placeholder="University or school name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Graduation Year</label>
            <input
              type="number"
              name="graduationYear"
              value={formData.education.graduationYear || ""}
              onChange={handleEducationChange}
              className="form-input"
              placeholder="e.g., 2023"
              min="1900"
              max="2030"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Job Preferences</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Job Type</label>
            <select
              name="jobType"
              value={formData.jobPreferences.jobType || ""}
              onChange={handleJobPreferencesChange}
              className="form-input"
            >
              <option value="">Select job type</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Expected Salary</label>
            <input
              type="text"
              name="expectedSalary"
              value={formData.jobPreferences.expectedSalary || ""}
              onChange={handleJobPreferencesChange}
              className="form-input"
              placeholder="e.g., $50,000 - $70,000"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="willingToRelocate"
                checked={formData.jobPreferences.willingToRelocate || false}
                onChange={handleJobPreferencesChange}
              />
              Willing to relocate
            </label>
          </div>
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

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-large" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  )
}