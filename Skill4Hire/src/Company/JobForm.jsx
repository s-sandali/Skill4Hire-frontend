// src/components/JobForm.jsx - Improved version with debugging
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { jobService } from "../services/jobService";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiSave,
  FiX,
  FiLoader,
  FiAlertTriangle,
  FiCheck,
  FiBriefcase,
} from "react-icons/fi";
import "./JobForm.css";

const JobForm = ({ jobId: propJobId, initialJob, onSave, onCancel }) => {
  const navigate = useNavigate();
  const { id: routeJobId } = useParams();
  const effectiveJobId = propJobId ?? routeJobId ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [fetchedJob, setFetchedJob] = useState(null);

  const defaultJob = useMemo(() => ({
    title: "",
    description: "",
    type: "FULL_TIME",
    location: "",
    salary: "",
    experience: "",
    deadline: "",
    skills: "",
  }), []);

  const mapJobToForm = useCallback((jobPayload) => ({
    title: jobPayload?.title || "",
    description: jobPayload?.description || "",
    type: jobPayload?.type || "FULL_TIME",
    location: jobPayload?.location || "",
    salary: jobPayload?.salary ? jobPayload.salary.toString() : "",
    experience: jobPayload?.experience ? jobPayload.experience.toString() : "",
    deadline: jobPayload?.deadline
      ? new Date(jobPayload.deadline).toISOString().split("T")[0]
      : "",
    skills: Array.isArray(jobPayload?.skills)
      ? jobPayload.skills.join(", ")
      : typeof jobPayload?.skills === "string"
        ? jobPayload.skills
    : "",
  }), []);

  const [job, setJob] = useState(() => ({ ...defaultJob }));

  const sourceJob = useMemo(() => initialJob ?? fetchedJob, [initialJob, fetchedJob]);
  const isEditMode = Boolean(effectiveJobId);
  const prevModeRef = useRef(isEditMode);

  // Hydrate form when editing or reset when creating
  useEffect(() => {
    if (isEditMode && sourceJob) {
      setJob(mapJobToForm(sourceJob));
    }
  }, [isEditMode, mapJobToForm, sourceJob]);

  useEffect(() => {
    if (prevModeRef.current && !isEditMode) {
      setJob({ ...defaultJob });
    }
    prevModeRef.current = isEditMode;
  }, [defaultJob, isEditMode]);

  // Fetch job when editing via route without initial data
  useEffect(() => {
    if (!isEditMode || initialJob) return;

    let cancelled = false;
    setPrefillLoading(true);
    jobService
      .getById(effectiveJobId)
      .then((data) => {
        if (!cancelled) {
          setFetchedJob(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("❌ Failed to load job for editing:", err);
          const message = err.response?.data?.message || err.message || "Unable to load job details";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setPrefillLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveJobId, initialJob, isEditMode]);

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
      const normalizedSkills = job.skills
        ? job.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

      const jobData = {
        title: job.title.trim(),
        description: job.description.trim(),
        type: job.type,
        location: job.location.trim(),
        salary: job.salary ? parseFloat(job.salary) : null,
        experience: job.experience ? parseInt(job.experience) : null,
        deadline: job.deadline,
        skills: normalizedSkills,
      };

      console.log("📦 Sending job payload:", jobData);

      let result;
      if (isEditMode) {
        result = await jobService.update(effectiveJobId, jobData);
        setSuccess("Job updated successfully!");
      } else {
        result = await jobService.create(jobData);
        setSuccess("Job created successfully!");
      }

      if (onSave) {
        onSave(result);
      } else {
        setTimeout(() => navigate("/jobs"), 1200);
      }

      if (onCancel) {
        setTimeout(() => onCancel(), 1500);
      }
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

  if (prefillLoading) {
    return (
      <div className="job-form-container">
        <div className="job-form-header">
          <div className="form-title">
            <FiBriefcase />
            <h2>Loading job details...</h2>
          </div>
        </div>
        <div className="loading-state">
          <FiLoader className="spinning" />
        </div>
      </div>
    );
  }

  return (
    <div className="job-form-container">
      <div className="job-form-header">
        <div className="form-title">
          <FiBriefcase />
          <h2>{isEditMode ? "Edit Job Posting" : "Create New Job Posting"}</h2>
        </div>
        <button
          className="close-form-btn"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              navigate("/jobs");
            }
          }}
          disabled={loading}
        >
          <FiX />
        </button>
      </div>

      {error && (
        <div className="form-message error">
          <FiAlertTriangle /> {error}
        </div>
      )}
      {success && (
        <div className="form-message success">
          <FiCheck /> {success}
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
            <label htmlFor="skills">Key Skills</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={job.skills}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, Communication"
            />
            <small className="input-help-text">
              Separate multiple skills with commas. This helps power candidate matching.
            </small>
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
            {loading ? <FiLoader className="spinning" /> : <FiSave />}
            {isEditMode ? "Update Job" : "Create Job"}
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