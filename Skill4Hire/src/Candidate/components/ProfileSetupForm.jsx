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
    // Match backend structure - objects instead of strings
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
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const { candidateService } = await import("../../services/candidateService");
      
      // First update profile data
      const profileDataToSend = {
        ...formData,
        phoneNumber: formData.phoneNumber,
        headline: formData.headline
      };
      
      console.log("Updating profile data...");
      await candidateService.updateProfile(profileDataToSend);
      
      // Upload files sequentially with proper error handling
      if (resumeFile) {
        console.log("Uploading resume file:", resumeFile.name);
        try {
          const resumeResponse = await candidateService.uploadResume(resumeFile);
          console.log("Resume upload successful:", resumeResponse);
        } catch (uploadError) {
          console.error("Resume upload failed:", uploadError);
          alert(`Resume upload failed: ${uploadError.message}. Profile was saved but resume was not uploaded.`);
        }
      }
      
      if (profilePictureFile) {
        console.log("Uploading profile picture:", profilePictureFile.name);
        try {
          const profilePicResponse = await candidateService.uploadProfilePicture(profilePictureFile);
          console.log("Profile picture upload successful:", profilePicResponse);
        } catch (uploadError) {
          console.error("Profile picture upload failed:", uploadError);
          alert(`Profile picture upload failed: ${uploadError.message}. Profile was saved but picture was not uploaded.`);
        }
      }
      
      // Refresh profile data after all uploads are complete
      if (onUpdate) {
        console.log("Refreshing profile data after file uploads...");
        // Add a small delay to ensure backend has processed the files
        setTimeout(() => {
          onUpdate();
        }, 1000);
      }
      
      alert("Profile updated successfully!");
      
      // Reset file states
      setResumeFile(null);
      setProfilePictureFile(null);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setIsLoading(false);
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
              placeholder="Enter your phone number"
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
          <label className="form-label">Professional Bio</label>
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
            <label className="form-label checkbox-label">
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
        <h3 className="section-title">File Uploads</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Resume Upload</label>
            <FileUpload
              onFileSelect={(file) => {
                console.log("Resume file selected:", file);
                setResumeFile(file);
              }}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              maxSize={5 * 1024 * 1024} // 5MB
              label="Upload Resume"
              description="PDF, DOC, or DOCX files only (max 5MB)"
            />
            {resumeFile && (
              <p className="file-selected">
                Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Profile Picture</label>
            <FileUpload
              onFileSelect={(file) => {
                console.log("Profile picture selected:", file);
                setProfilePictureFile(file);
              }}
              accept="image/*,.jpg,.jpeg,.png,.gif"
              maxSize={2 * 1024 * 1024} // 2MB
              label="Upload Profile Picture"
              description="JPG, PNG, or GIF files only (max 2MB)"
            />
            {profilePictureFile && (
              <p className="file-selected">
                Selected: {profilePictureFile.name} ({(profilePictureFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
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