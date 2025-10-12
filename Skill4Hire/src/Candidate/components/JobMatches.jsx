"use client"

import { useEffect, useMemo, useState } from "react";
import { jobService } from "../../services/jobService";
import { candidateService } from "../../services/candidateService";
import "../base.css";

const normalizeJobs = (payload) => {
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload?.jobs)
        ? payload.jobs
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

  return rawList.map((job, index) => {
    const skillsArray = Array.isArray(job?.requiredSkills)
      ? job.requiredSkills
      : Array.isArray(job?.skills)
        ? job.skills
        : typeof job?.skills === 'string'
          ? job.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [];

    return {
      id: job?.id || job?.jobPostId || job?.jobId || `job-${index}`,
      title: job?.title || job?.jobTitle || job?.role || 'Role not specified',
      company: job?.companyName || job?.company || job?.employer?.name || 'Company not specified',
      location: job?.location || job?.jobLocation || job?.city || 'Location not provided',
      matchScore: job?.matchScore ?? job?.matchingScore ?? job?.score ?? null,
      summary: job?.summary || job?.description || job?.shortDescription || '',
      salary: job?.salaryRange || job?.salary || job?.compensation || '',
      skills: skillsArray,
      postedAt: job?.postedAt || job?.createdAt || job?.publishedAt || null,
    };
  });
};

const percent = (score) => {
  if (score === null || score === undefined) return null;
  const n = Number(score);
  if (Number.isNaN(n)) return null;
  if (n > 0 && n <= 1) return Math.round(n * 100);
  if (n > 1 && n <= 100) return Math.round(n);
  return Math.round(n);
};

export default function JobMatches() {
  const [keyword, setKeyword] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [applyState, setApplyState] = useState({});

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      setInfo("");
      try {
        const q = keyword.trim();
        const params = q ? { keyword: q } : {};
        const usePublic = Boolean(q);
        const res = usePublic
          ? await jobService.search(params)
          : await jobService.searchWithMatching(params);
        if (cancelled) return;
        setJobs(normalizeJobs(res));
        if (usePublic) setInfo(`Showing results for "${q}"`);
      } catch (e1) {
        if (cancelled) return;
        try {
          const fallback = await jobService.listPublic();
          if (cancelled) return;
          setJobs(normalizeJobs(fallback));
          const q = keyword.trim();
          setInfo(q ? `Showing public listings; personalized results unavailable for "${q}".` : 'Showing public listings; personalized results unavailable.');
          setError("");
        } catch (e2) {
          if (cancelled) return;
          setJobs([]);
          setError(e2?.response?.data?.message || e2.message || 'Failed to load jobs');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchJobs();
    return () => { cancelled = true; };
  }, [keyword]);

  const handleApply = async (jobId) => {
    if (!jobId) return;
    setApplyState((prev) => ({ ...prev, [jobId]: { status: 'loading' } }));
    try {
      await candidateService.applyToJob(jobId);
      setApplyState((prev) => ({ ...prev, [jobId]: { status: 'success' } }));
    } catch (err) {
      setApplyState((prev) => ({
        ...prev,
        [jobId]: { status: 'error', message: err?.message || 'Failed to apply' }
      }));
    }
  };

  const list = useMemo(() => jobs, [jobs]);

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1>Find Jobs</h1>
        <p className="muted">Search public listings or see personalized matches when signed in.</p>
      </div>

      <div className="jobs-controls">
        <input
          className="apps-input"
          type="text"
          placeholder="Search by keyword, title, or skill..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {info && <div className="info-banner">{info}</div>}
      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading">Loading jobs...</div>}

      {!loading && list.length === 0 && (
        <div className="empty">No jobs found.</div>
      )}

      <div className="jobs-grid">
        {list.map((job) => {
          const s = percent(job.matchScore);
          const apply = applyState[job.id]?.status;
          return (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <div>
                  <h3>{job.title}</h3>
                  <p className="muted">{job.company} • {job.location}</p>
                </div>
                {s !== null && <span className="badge">{s}% match</span>}
              </div>
              <p className="job-summary">{job.summary}</p>
              {job.skills?.length > 0 && (
                <div className="skills-list">
                  {job.skills.slice(0, 8).map((sk) => (
                    <span key={`${job.id}-${sk}`} className="skill-tag">{sk}</span>
                  ))}
                </div>
              )}
              <div className="job-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(job.id)}
                  disabled={apply === 'loading'}
                >
                  {apply === 'loading' ? 'Applying...' : apply === 'success' ? 'Applied' : 'Apply'}
                </button>
                {apply === 'error' && (
                  <span className="error-text">{applyState[job.id]?.message}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

