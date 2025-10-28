"use client"

import { useEffect, useState } from "react"
import FileUpload from "./FileUpload"
import "../base.css"
import "../buttons.css"
import "./ProfileSetupForm.css"

const noop = () => {}

export default function ProfileSetupForm({
  candidate,
  onUpdate,
  onResumeSelected = noop,
  onProfilePictureSelected = noop
}) {
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
  const [resumePreviewUrl, setResumePreviewUrl] = useState("")
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState("")
  const resumeSourceLabel = resumeFile?.name || candidate?.resumeFileName || ""
  const truncatedResumeLabel = resumeSourceLabel.length > 32 ? `${resumeSourceLabel.slice(0, 29)}...` : resumeSourceLabel
  const skillsCount = formData.skills.length
  const hasResumeOnFile = Boolean(resumeSourceLabel)
  const existingProfilePicture = candidate?.profilePictureUrl

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

  useEffect(() => () => {
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl)
    }
    if (profilePicturePreviewUrl) {
      URL.revokeObjectURL(profilePicturePreviewUrl)
    }
  }, [resumePreviewUrl, profilePicturePreviewUrl])

  const handleResumeSelection = (file) => {
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl)
      setResumePreviewUrl("")
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setResumePreviewUrl(previewUrl)
      onResumeSelected({ file, previewUrl, fileName: file.name })
    } else {
      onResumeSelected(null)
    }

    setResumeFile(file)
  }

  const handleProfilePictureSelection = (file) => {
    if (profilePicturePreviewUrl) {
      URL.revokeObjectURL(profilePicturePreviewUrl)
      setProfilePicturePreviewUrl("")
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setProfilePicturePreviewUrl(previewUrl)
      onProfilePictureSelected({ file, previewUrl, fileName: file.name })
    } else {
      onProfilePictureSelected(null)
    }

    setProfilePictureFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const profileDataToSend = {
      ...formData,
      phoneNumber: formData.phoneNumber,
      headline: formData.headline
    };

    const mergedSnapshot = {
      ...candidate,
      ...profileDataToSend,
      resumeFileName: resumeFile?.name || candidate?.resumeFileName || candidate?.resume || "",
      resumeUrl: resumePreviewUrl || candidate?.resumeUrl || candidate?.resumeDownloadUrl || candidate?.resumePath || "",
      profilePictureUrl: profilePicturePreviewUrl || existingProfilePicture || candidate?.profilePictureUrl || candidate?.profilePicturePath || ""
    };

    try {
      const { candidateService } = await import("../../services/candidateService");

      console.log("Updating profile data...");
      await candidateService.updateProfile(profileDataToSend);

      if (resumeFile) {
        console.log("Uploading resume file:", resumeFile.name);
        try {
          const resumeResponse = await candidateService.uploadResume(resumeFile);
          console.log("Resume upload successful:", resumeResponse);
          if (resumeResponse) {
            mergedSnapshot.resumeUrl = resumeResponse.downloadUrl || resumeResponse.url || mergedSnapshot.resumeUrl;
            mergedSnapshot.resumeFileName = resumeResponse.fileName || resumeResponse.originalFileName || mergedSnapshot.resumeFileName;
          }
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
          if (profilePicResponse) {
            mergedSnapshot.profilePictureUrl =
              profilePicResponse.imageUrl || profilePicResponse.url || profilePicResponse.profilePictureUrl || mergedSnapshot.profilePictureUrl;
          }
        } catch (uploadError) {
          console.error("Profile picture upload failed:", uploadError);
          alert(`Profile picture upload failed: ${uploadError.message}. Profile was saved but picture was not uploaded.`);
        }
      }

      if (onUpdate) {
        await onUpdate(mergedSnapshot, { refresh: true });
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (onUpdate) {
        await onUpdate(mergedSnapshot, { refresh: false });
      }
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form-header">
        <div>
          <h2>Candidate Profile Setup</h2>
          <p>Keep your information current so recruiters can get in touch faster.</p>
        </div>
        <div className="profile-form-header-meta">
          <span className="profile-form-badge">{skillsCount} skill{skillsCount === 1 ? "" : "s"}</span>
          <span className={`profile-form-badge ${hasResumeOnFile ? "is-success" : "is-warning"}`}>
            {hasResumeOnFile ? `Resume: ${truncatedResumeLabel}` : "Resume not uploaded"}
          </span>
        </div>
      </div>
      <div className="profile-form-grid">
        <div className="form-section form-section--full">
          <div className="section-intro">
            <h3 className="section-title">Basic Information</h3>
            <p>These core details appear on your profile card when employers view your application.</p>
          </div>
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
          <div className="section-intro">
            <h3 className="section-title">Professional Story</h3>
            <p>Set the tone with a title and short introduction recruiters can skim quickly.</p>
          </div>
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
              placeholder="Summarize your experience, specialties, and what you're exploring next..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-intro">
            <h3 className="section-title">Skills &amp; Tools</h3>
            <p>Spotlight the capabilities you want to be matched on. Add as many as you need.</p>
          </div>
          <div className="skills-input-group">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="form-input"
              placeholder="Add a skill"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addSkill()
                }
              }}
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
            {formData.skills.length === 0 && (
              <span className="empty-state">No skills added yet. Start with your strongest tools or soft skills.</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="section-intro">
            <h3 className="section-title">Experience Snapshot</h3>
            <p>Sharing your latest experience helps us surface more relevant opportunities.</p>
          </div>
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
          <div className="section-intro">
            <h3 className="section-title">Education</h3>
            <p>Give context about your academic background or certifications.</p>
          </div>
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

        <div className="form-section form-section--full upload-section">
          <div className="section-intro">
            <h3 className="section-title">File Uploads</h3>
            <p>Keep documents fresh so recruiters can download the latest version instantly.</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Resume Upload</label>
              <FileUpload
                onFileSelect={(file) => {
                  console.log("Resume file selected:", file);
                  handleResumeSelection(file);
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
              {!resumeFile && candidate?.resumeFileName && (
                <p className="file-selected">
                  Current on file: {candidate.resumeFileName}
                </p>
              )}
              {resumePreviewUrl && (
                <a href={resumePreviewUrl} target="_blank" rel="noreferrer" className="resume-preview-chip">
                  Preview newly selected resume
                </a>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Profile Picture</label>
              <FileUpload
                onFileSelect={(file) => {
                  console.log("Profile picture selected:", file);
                  handleProfilePictureSelection(file);
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
              {!profilePictureFile && existingProfilePicture && (
                <p className="file-selected">Current photo is already uploaded.</p>
              )}
              {(profilePicturePreviewUrl || existingProfilePicture) && (
                <div className="profile-picture-preview">
                  <img src={profilePicturePreviewUrl || existingProfilePicture} alt="Profile preview" />
                  <span>{profilePicturePreviewUrl ? "Preview" : "Current photo"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section form-section--full">
          <div className="section-intro">
            <h3 className="section-title">Links &amp; Portfolio</h3>
            <p>These optional links let hiring teams explore more of your work.</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://www.linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://github.com/username"
              />
            </div>
            <div className="form-group form-group-full">
              <label className="form-label">Portfolio or Website</label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://your-portfolio.com"
              />
            </div>
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