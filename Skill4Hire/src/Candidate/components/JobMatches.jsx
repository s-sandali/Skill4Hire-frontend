"use client"

import { useEffect, useMemo, useState } from "react";
import { jobService } from "../../services/jobService";
import { candidateService } from "../../services/candidateService";
import apiClient from "../../utils/axiosConfig";
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
      companyLogo: j?.companyLogo || j?.companyLogoUrl || j?.employer?.logo || j?.employer?.logoUrl || '',
      location: j?.location || j?.jobLocation || j?.city || '',
      matchScore: null, // removed from UI
      summary: j?.summary || j?.description || j?.shortDescription || '',
      salary: j?.salaryRange || j?.salary || j?.compensation || '',
      skills: skillsArray,
      postedAt: j?.postedAt || j?.createdAt || j?.publishedAt || null,
    };
  });
};

// Normalize potential relative URLs for images
const API_BASE = apiClient?.defaults?.baseURL || '';
const toImageUrl = (url) => {
  if (!url) return '';
  if (/^(data:|blob:)/i.test(url)) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
};

const percent = (score) => null; // no longer used

export default function JobMatches() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState(""); // e.g., "50000-70000" or "100000+"
  const [expRange, setExpRange] = useState(""); // e.g., "0-2", "2-5", "5-10", "10+"
  const [sortBy, setSortBy] = useState("newest");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [applyState, setApplyState] = useState({});
  const [appliedJobs, setAppliedJobs] = useState(() => new Set());
  const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

  const [filterOptions, setFilterOptions] = useState({ types: [], locations: [], salaryRanges: [], experienceRanges: [] });

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
          salaryRanges: Array.isArray(opts?.salaryRanges) ? opts.salaryRanges : [],
          experienceRanges: Array.isArray(opts?.experienceRanges) ? opts.experienceRanges : [],
        });
      } catch {
        // non-fatal
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Helper: parse salary and experience ranges
  const parseSalaryRange = (s) => {
    if (!s) return { min: undefined, max: undefined };
    if (s.endsWith("+")) {
      const n = parseFloat(s);
      return { min: Number.isFinite(n) ? n : undefined, max: undefined };
    }
    const [a, b] = s.split("-").map((x) => parseFloat(x));
    return { min: Number.isFinite(a) ? a : undefined, max: Number.isFinite(b) ? b : undefined };
  };
  const parseExpRangeToMax = (s) => {
    if (!s) return undefined;
    if (s.endsWith("+")) {
      const n = parseInt(s, 10);
      return Number.isFinite(n) ? n : undefined; // treat "10+" as <= 10 due to backend maxExperience support
    }
    const parts = s.split("-");
    const upper = parseInt(parts[1], 10);
    return Number.isFinite(upper) ? upper : undefined;
  };

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
        const { min: sMin, max: sMax } = parseSalaryRange(salaryRange);
        if (Number.isFinite(sMin)) params.minSalary = sMin;
        if (Number.isFinite(sMax)) params.maxSalary = sMax;
        const expMax = parseExpRangeToMax(expRange);
        if (Number.isFinite(expMax)) params.maxExperience = expMax;

        const usingFilters = Boolean(type || location || salaryRange || expRange);

        let res;
        if (usingFilters || q) {
          res = await jobService.search(params);
          setInfo(buildInfo({ q, type, location, salaryRange, expRange }));
        } else {
          res = await jobService.searchWithMatching({});
          setInfo('Personalized matches');
        }
        if (cancelled) return;
        let list = normalizeJobs(res);
        list = sortJobs(list, sortBy);
        setJobs(list);
      } catch (e) {
        if (cancelled) return;
        try {
          let fallback = await jobService.listPublic();
          if (cancelled) return;
          fallback = sortJobs(normalizeJobs(fallback), sortBy);
          setJobs(fallback);
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
  }, [keyword, type, location, salaryRange, expRange, sortBy]);

  const sortJobs = (arr, mode) => {
    const list = Array.isArray(arr) ? [...arr] : [];
    switch (mode) {
      case 'salary-desc':
        return list.sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0));
      case 'salary-asc':
        return list.sort((a, b) => (a.salary ?? 0) - (b.salary ?? 0));
      case 'title':
        return list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
      case 'newest':
      default:
        return list.sort((a, b) => new Date(b.postedAt || b.createdAt || 0) - new Date(a.postedAt || a.createdAt || 0));
    }
  };

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
      showToast('info', already ? 'You already applied to this role earlier.' : 'Application sent! We’ll notify you about updates.');
      try { window.dispatchEvent(new CustomEvent('applications:changed')); } catch {}
    } catch (err) {
      setApplyState((prev) => ({
        ...prev,
        [jobId]: { status: 'error', message: err?.message || 'Failed to apply' }
      }));
      showToast('error', err?.message || 'Sorry, we couldn’t submit your application. Please try again.');
    }
  };

  const handleViewApplication = () => {
    try { window.dispatchEvent(new CustomEvent('candidate:navigate', { detail: { tab: 'applications' } })); } catch {}
  };

  const clearFilters = () => {
    setKeyword("");
    setType("");
    setLocation("");
    setSalaryRange("");
    setExpRange("");
    setSortBy("newest");
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

      <div className="jobs-controls" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
        <input
          className="apps-input"
          type="text"
          placeholder="Title or keywords"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
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
        <select className="apps-select" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)}>
          <option value="">Salary Range</option>
          {filterOptions.salaryRanges.map((r) => (
            <option key={r} value={r}>{r.replace('+', '+')}</option>
          ))}
        </select>
        <select className="apps-select" value={expRange} onChange={(e) => setExpRange(e.target.value)}>
          <option value="">Max Experience</option>
          {filterOptions.experienceRanges.map((r) => (
            <option key={r} value={r}>{r.replace('+', '+')} yrs</option>
          ))}
        </select>
        <select className="apps-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="salary-desc">Salary: High to Low</option>
          <option value="salary-asc">Salary: Low to High</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        {info && <div className="info-banner" style={{ flex: 1, marginRight: 8 }}>{info}</div>}
        <button className="btn btn-secondary" onClick={clearFilters} title="Clear all filters">Clear</button>
      </div>

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
          const logoUrl = job.companyLogo ? toImageUrl(job.companyLogo) : '';
          return (
            <div key={job.id} className="job-card">
              <div className="job-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="company-logo">
                    {logoUrl ? (
                      <img src={logoUrl} alt={job.company || 'Company logo'} />
                    ) : (
                      <span style={{ fontWeight: 600, color: '#6b7280', fontSize: 14 }}>{job.company?.charAt(0) ?? '•'}</span>
                    )}
                  </div>
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

function buildInfo({ q, type, location, salaryRange, expRange }) {
  const parts = [];
  if (q) parts.push(`keyword "${q}"`);
  if (type) parts.push(`type ${type}`);
  if (location) parts.push(`location ${location}`);
  if (salaryRange) parts.push(`salary ${salaryRange}`);
  if (expRange) parts.push(`max experience ${expRange}`);
  if (parts.length === 0) return '';
  return `Filters: ${parts.join(', ')}`;
}