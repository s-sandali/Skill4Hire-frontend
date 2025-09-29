// src/components/JobForm.jsx - Improved version with debugging
import { useState, useEffect } from "react";
import { jobService } from "../services/jobService";
import {
  RiSaveLine,
  RiCloseLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckLine,
  RiBriefcaseLine,
} from "react-icons/ri";

const JobForm = ({ jobId, initialJob, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [job, setJob] = useState({
    title: "",
    description: "",
    type: "FULL_TIME",
    location: "",
    salary: "",
    experience: "",
    deadline: "",
  });

  // Hydrate form when editing or reset when creating
  useEffect(() => {
    console.log('🔄 JobForm useEffect - jobId:', jobId, 'initialJob:', initialJob);
    
    if (initialJob && jobId) {
      // Editing mode - populate form with existing job data
      console.log('✏️ Setting form for editing:', initialJob);
      setJob({
        title: initialJob.title || "",
        description: initialJob.description || "",
        type: initialJob.type || "FULL_TIME",
        location: initialJob.location || "",
        salary: initialJob.salary ? initialJob.salary.toString() : "",
        experience: initialJob.experience ? initialJob.experience.toString() : "",
        deadline: initialJob.deadline
          ? new Date(initialJob.deadline).toISOString().split("T")[0]
          : "",
      });
    } else {
      // Creating mode - reset form
      console.log('➕ Resetting form for creation');
      setJob({
        title: "",
        description: "",
        type: "FULL_TIME",
        location: "",
        salary: "",
        experience: "",
        deadline: "",
      });
    }
  }, [jobId, initialJob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Build the job data payload
      const jobData = {
        title: job.title.trim(),
        description: job.description.trim(),
        type: job.type,
        location: job.location.trim(),
        salary: job.salary ? parseFloat(job.salary) : null,
        experience: job.experience ? parseInt(job.experience) : null,
        deadline: job.deadline,
      };

      console.log("📦 Sending job payload:", jobData);

      let result;
      if (jobId) {
        result = await jobService.update(jobId, jobData);
        setSuccess("Job updated successfully!");
      } else {
        result = await jobService.create(jobData);
        setSuccess("Job created successfully!");
      }

      if (onSave) onSave(result);
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 1500);
    } catch (err) {
      console.error("❌ Job save error:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          err.message || 
                          "Failed to save job";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-form-container">
      <div className="job-form-header">
        <div className="form-title">
          <RiBriefcaseLine />
          <h2>{jobId ? "Edit Job Posting" : "Create New Job Posting"}</h2>
        </div>
        <button
          className="close-form-btn"
          onClick={onCancel}
          disabled={loading}
        >
          <RiCloseLine />
        </button>
      </div>

      {error && (
        <div className="form-message error">
          <RiErrorWarningLine /> {error}
        </div>
      )}
      {success && (
        <div className="form-message success">
          <RiCheckLine /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={job.title}
              onChange={handleChange}
              placeholder="Enter job title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Job Type *</label>
            <select
              id="type"
              name="type"
              value={job.type}
              onChange={handleChange}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={job.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Application Deadline *</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={job.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary ($)</label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={job.salary}
              onChange={handleChange}
              placeholder="e.g., 60000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience (years)</label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={job.experience}
              onChange={handleChange}
              placeholder="e.g., 3"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={job.description}
              onChange={handleChange}
              placeholder="Enter job description"
              rows="5"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <RiLoader4Line className="spinning" /> : <RiSaveLine />}
            {jobId ? "Update Job" : "Create Job"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;