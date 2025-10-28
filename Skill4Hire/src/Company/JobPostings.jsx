import { useEffect, useMemo, useState } from "react";
import { jobService } from "../services/jobService";
import { useNavigate } from "react-router-dom";
import {
  RiAddLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiDeleteBinLine,
  RiEditLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiUserStarLine,
} from "react-icons/ri";
import "./JobPostings.css";

const JOB_TYPE_LABELS = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
  TEMPORARY: "Temporary",
  REMOTE: "Remote",
};

const toSkillList = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.filter(Boolean);
  }
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }
  return [];
};

const getJobStatus = (deadline) => {
  if (!deadline) {
    return { label: "Open", tone: "active", description: "No deadline set" };
  }
  const cutoff = new Date(deadline);
  if (Number.isNaN(cutoff.getTime())) {
    return { label: "Open", tone: "active", description: "Deadline unavailable" };
  }
  const now = new Date();
  const diffMs = cutoff.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return {
      label: "Closed",
      tone: "inactive",
      description: `Closed ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`,
    };
  }
  if (diffDays <= 3) {
    return {
      label: "Closing soon",
      tone: "warning",
      description: diffDays === 0 ? "Closes today" : `Closes in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
    };
  }
  return {
    label: "Active",
    tone: "active",
    description: `Closes in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
  };
};

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "Salary negotiable";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const loadJobs = async () => {
    try {
      const data = await jobService.getAll();
      setJobs(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to load job postings";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      setDeletingId(id);
      await jobService.remove(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
      setError("");
    } catch (err) {
      console.error("Failed to delete job:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to delete job";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const first = new Date(a?.createdAt || a?.updatedAt || a?.deadline || 0).getTime();
        const second = new Date(b?.createdAt || b?.updatedAt || b?.deadline || 0).getTime();
        return second - first;
      }),
    [jobs]
  );

  return (
    <div className="job-postings">
      <div className="job-postings__header">
        <div className="job-postings__title">
          <span className="job-postings__badge">
            <RiBriefcaseLine />
          </span>
          <div>
            <h2>Job Postings</h2>
            <p>Manage active openings and keep candidates informed.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/jobs/create")}
          className="btn-primary job-postings__create"
        >
          <RiAddLine /> New Job
        </button>
      </div>

      {error && (
        <div className="job-postings__alert job-postings__alert--error">
          <RiErrorWarningLine />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="job-postings__loader">
          <RiLoader4Line className="spinning" />
          <p>Loading job postings...</p>
        </div>
      ) : sortedJobs.length === 0 ? (
        <div className="job-postings__empty">
          <div className="job-postings__empty-icon">
            <RiBriefcaseLine />
          </div>
          <h3>No job postings yet</h3>
          <p>
            Create your first opening to start attracting candidates. You can manage the status, salary, and skill
            tags at any time.
          </p>
          <button
            type="button"
            onClick={() => navigate("/jobs/create")}
            className="btn-primary"
          >
            <RiAddLine /> Create a job
          </button>
        </div>
      ) : (
        <div className="job-postings__grid">
          {sortedJobs.map((job) => {
            const skills = toSkillList(job.skills);
            const status = getJobStatus(job.deadline);
            const jobType = JOB_TYPE_LABELS[job.type] || job.type || "Job type";
            const deadlineDate = job.deadline ? new Date(job.deadline) : null;
            const deadlineLabel = deadlineDate && !Number.isNaN(deadlineDate.getTime())
              ? deadlineDate.toLocaleDateString()
              : "Not set";
            const experienceLabel = job.experience
              ? `${job.experience} year${Number(job.experience) === 1 ? "" : "s"} experience`
              : "Experience flexible";

            return (
              <article key={job.id} className="job-card">
                <div className="job-card__header">
                  <div className="job-card__heading">
                    <h3>{job.title || "Untitled position"}</h3>
                    <p>{job.description || "No description provided."}</p>
                  </div>
                  <span className={`job-card__status job-card__status--${status.tone}`}>
                    {status.label}
                  </span>
                </div>
                <p className="job-card__status-detail">{status.description}</p>

                <ul className="job-card__meta">
                  <li>
                    <RiMapPinLine />
                    <span>{job.location || "Location flexible"}</span>
                  </li>
                  <li>
                    <RiBriefcaseLine />
                    <span>{jobType}</span>
                  </li>
                  <li>
                    <RiMoneyDollarCircleLine />
                    <span>{formatCurrency(job.salary)}</span>
                  </li>
                  <li>
                    <RiUserStarLine />
                    <span>{experienceLabel}</span>
                  </li>
                  <li>
                    <RiTimeLine />
                    <span>{deadlineLabel}</span>
                  </li>
                  {job.createdAt && (
                    <li>
                      <RiCalendarLine />
                      <span>
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  )}
                </ul>

                {skills.length > 0 && (
                  <div className="job-card__skills">
                    {skills.map((skill) => (
                      <span key={skill} className="job-card__skill">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="job-card__actions">
                  <button
                    type="button"
                    className="btn-outline job-card__action"
                    onClick={() => navigate(`/jobs/edit/${job.id}`)}
                  >
                    <RiEditLine /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger job-card__action"
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingId === job.id}
                  >
                    {deletingId === job.id ? <RiLoader4Line className="spinning" /> : <RiDeleteBinLine />} Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobPostings;
