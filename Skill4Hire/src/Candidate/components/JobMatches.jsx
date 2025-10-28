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
    const j = job?.job || job?.jobPost || job; // support older matching format and enriched DTO
    const skillsArray = Array.isArray(j?.requiredSkills)
      ? j.requiredSkills
      : Array.isArray(j?.skills)
        ? j.skills
        : typeof j?.skills === 'string'
          ? j.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [];

    return {
      id: j?.id || j?.jobPostId || j?.jobId || `job-${index}`,
      title: j?.title || j?.jobTitle || j?.role || '',
      company: j?.companyName || j?.company || j?.employer?.name || '',
      companyLogo: j?.companyLogo || j?.employer?.logo || '',
      location: j?.location || j?.jobLocation || j?.city || '',
      matchScore: null, // removed from UI
      summary: j?.summary || j?.description || j?.shortDescription || '',
      salary: j?.salaryRange || j?.salary || j?.compensation || '',
      skills: skillsArray,
      postedAt: j?.postedAt || j?.createdAt || j?.publishedAt || null,
    };
  });
};

const percent = (score) => null; // no longer used

export default function JobMatches() {
  const [keyword, setKeyword] = useState("");
  const [skill, setSkill] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [applyState, setApplyState] = useState({});
  const [appliedJobs, setAppliedJobs] = useState(() => new Set());
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

  const [filterOptions, setFilterOptions] = useState({ types: [], locations: [] });

  // Load already-applied jobs once and when applications change
  useEffect(() => {
    let cancelled = false;
    const loadApplied = async () => {
      try {
        const res = await candidateService.getApplications();
        const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
        const ids = new Set(
          list
            .map((a) => a.jobId || a.jobPostId || a.job?.id)
            .filter(Boolean)
            .map((id) => String(id))
        );
        if (!cancelled) setAppliedJobs(ids);
      } catch {
        // ignore; state will update after successful apply
      }
    };
    loadApplied();
    const onChanged = () => loadApplied();
    try { window.addEventListener('applications:changed', onChanged); } catch {}
    return () => {
      cancelled = true;
      try { window.removeEventListener('applications:changed', onChanged); } catch {}
    };
  }, []);

  // Load filter options once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const opts = await jobService.getFilterOptions();
        if (cancelled) return;
        setFilterOptions({
          types: Array.isArray(opts?.types) ? opts.types : [],
          locations: Array.isArray(opts?.locations) ? opts.locations : [],
        });
      } catch {
        // non-fatal: filter dropdowns fall back to empty lists
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch jobs when filters change
  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      setInfo("");
      try {
        const params = {};
        const q = keyword.trim();
        if (q) params.keyword = q;
        if (type) params.type = type;
        if (location) params.location = location;
        const min = parseFloat(minSalary);
        const max = parseFloat(maxSalary);
        if (!Number.isNaN(min)) params.minSalary = min;
        if (!Number.isNaN(max)) params.maxSalary = max;
        if (skill.trim()) params.skill = skill.trim(); // supported by basic search

        const usingFilters = Boolean(type || location || skill || minSalary || maxSalary);

        let res;
        if (usingFilters || q) {
          // Use basic search when explicit filters or keyword present
          res = await jobService.search(params);
          setInfo(buildInfo({ q, type, location, min, max, skill: skill.trim() }));
        } else {
          // No filters/keyword => try personalized matches for signed-in candidates
          res = await jobService.searchWithMatching({});
          setInfo('Personalized matches');
        }
        if (cancelled) return;
        setJobs(normalizeJobs(res));
      } catch (e) {
        if (cancelled) return;
        try {
          const fallback = await jobService.listPublic();
          if (cancelled) return;
          setJobs(normalizeJobs(fallback));
          setInfo('Showing public listings; personalized or filtered results unavailable.');
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
  }, [keyword, skill, type, location, minSalary, maxSalary]);

  const showToast = (type, message, duration = 3000) => {
    setToast({ show: true, type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast((t) => ({ ...t, show: false })), duration);
  };

  const handleApply = async (jobId) => {
    if (!jobId) return;
    setApplyState((prev) => ({ ...prev, [jobId]: { status: 'loading' } }));
    try {
      const result = await candidateService.applyToJob(jobId);
      const already = result && result.alreadyApplied;
      setApplyState((prev) => ({ ...prev, [jobId]: { status: 'success', already } }));
      setAppliedJobs((prev) => new Set(prev).add(String(jobId)));
      showToast('info', already ? 'You already applied to this job.' : 'Application submitted.');
      try { window.dispatchEvent(new CustomEvent('applications:changed')); } catch {}
    } catch (err) {
      setApplyState((prev) => ({
        ...prev,
        [jobId]: { status: 'error', message: err?.message || 'Failed to apply' }
      }));
      showToast('error', err?.message || 'Failed to apply');
    }
  };

  const handleViewApplication = () => {
    try { window.dispatchEvent(new CustomEvent('candidate:navigate', { detail: { tab: 'applications' } })); } catch {}
  };

  const list = useMemo(() => jobs, [jobs]);

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1>Find Jobs</h1>
        <p className="muted">Search public listings or see personalized matches when signed in.</p>
      </div>

      {toast.show && (
        <div className={toast.type === 'error' ? 'error-banner' : 'info-banner'} style={{ marginBottom: 8 }}>
          {toast.message}
        </div>
      )}

      <div className="jobs-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 8 }}>
        <input
          className="apps-input"
          type="text"
          placeholder="Title or keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          className="apps-input"
          type="text"
          placeholder="Skill (e.g., React)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <select className="apps-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Type</option>
          {filterOptions.types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className="apps-select" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Location</option>
          {filterOptions.locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <input
          className="apps-input"
          type="number"
          min="0"
          placeholder="Min Salary"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
        />
        <input
          className="apps-input"
          type="number"
          min="0"
          placeholder="Max Salary"
          value={maxSalary}
          onChange={(e) => setMaxSalary(e.target.value)}
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
          const apply = applyState[job.id]?.status;
          const isApplied = appliedJobs.has(String(job.id)) || apply === 'success' || Boolean(applyState[job.id]?.already);
          const meta = [job.company, job.location].filter(Boolean).join(' • ');
          return (
            <div key={job.id} className="job-card">
              <div className="job-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.company || 'Company logo'} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 14 }}>
                      {job.company?.charAt(0) ?? '•'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0 }}>{job.title || ' '}</h3>
                    {meta && <p className="muted" style={{ margin: 0 }}>{meta}</p>}
                  </div>
                </div>
              </div>
              {job.summary && <p className="job-summary">{job.summary}</p>}
              {job.skills?.length > 0 && (
                <div className="skills-list">
                  {job.skills.slice(0, 8).map((sk) => (
                    <span key={`${job.id}-${sk}`} className="skill-tag">{sk}</span>
                  ))}
                </div>
              )}
              <div className="job-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(job.id)}
                  disabled={apply === 'loading' || isApplied}
                >
                  {apply === 'loading' ? 'Applying...' : isApplied ? 'Applied' : 'Apply'}
                </button>
                {isApplied && (
                  <button className="btn btn-secondary" onClick={handleViewApplication}>
                    View Application
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildInfo({ q, type, location, min, max, skill }) {
  const parts = [];
  if (q) parts.push(`keyword "${q}"`);
  if (skill) parts.push(`skill "${skill}"`);
  if (type) parts.push(`type ${type}`);
  if (location) parts.push(`location ${location}`);
  if (Number.isFinite(min) || Number.isFinite(max)) {
    const m1 = Number.isFinite(min) ? min : 0;
    const m2 = Number.isFinite(max) ? max : '∞';
    parts.push(`salary ${m1}-${m2}`);
  }
  if (parts.length === 0) return '';
  return `Filters: ${parts.join(', ')}`;
}