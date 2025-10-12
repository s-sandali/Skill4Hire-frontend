"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import CandidateLayout from "./components/CandidateLayout.jsx"
import CandidateHome from "./CandidateHome.jsx"
import ProfileOverview from "./components/ProfileOverview.jsx"
import Applications from "./components/Applications.jsx"
import ProfileSetupForm from "./components/ProfileSetupForm.jsx"
import JobMatches from "./components/JobMatches.jsx"
import { candidateService } from "../services/candidateService"
import { jobService } from "../services/jobService"
import "./base.css"
import "./buttons.css"
import "./dashboard.css"

export default function CandidatePage() {
  const location = useLocation()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [appsCount, setAppsCount] = useState(0)
  const [appsByStatus, setAppsByStatus] = useState({})

  useEffect(() => {
    fetchCandidateProfile()
    fetchApplications()
  }, [])

  useEffect(() => {
    const onAppsChanged = () => {
      fetchApplications();
    };
    window.addEventListener('applications:changed', onAppsChanged);
    return () => window.removeEventListener('applications:changed', onAppsChanged);
  }, []);

  const fetchCandidateProfile = async () => {
    try {
      const profile = await candidateService.getProfile()
      setCandidate(profile)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const res = await candidateService.getApplications()
      const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : [])
      setAppsCount(list.length)
      const byStatus = {}
      list.forEach(a => {
        const s = String(a.status || a.applicationStatus || 'Applied')
        byStatus[s] = (byStatus[s] || 0) + 1
      })
      setAppsByStatus(byStatus)
    } catch (err) {
      console.warn('Failed to load applications for dashboard:', err?.message || err)
      setAppsCount(0)
      setAppsByStatus({})
    }
  }

  const getCurrentView = () => {
    const path = location.pathname
    
    if (path === "/candidate-dashboard") {
      return <DashboardView candidate={candidate} appsCount={appsCount} appsByStatus={appsByStatus} />
    } else if (path === "/candidate-profile") {
      return <ProfileOverview candidate={candidate} />
    } else if (path === "/candidate-applications") {
      return <Applications />
    } else if (path === "/candidate-setup") {
      return <SetupView candidate={candidate} onUpdate={() => { fetchCandidateProfile(); fetchApplications(); }} />
    } else if (path === "/candidate-home") {
      return <CandidateHome />
    } else if (path === "/candidate-jobs" || path === "/candidate-matches") {
      return <JobMatches />
    }
    
    return <DashboardView candidate={candidate} appsCount={appsCount} appsByStatus={appsByStatus} />
  }

  if (loading) {
    return (
      <CandidateLayout>
        <div className="loading">Loading your dashboard...</div>
      </CandidateLayout>
    )
  }

  return <CandidateLayout>{getCurrentView()}</CandidateLayout>
}

const DashboardView = ({ candidate, appsCount, appsByStatus }) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's your career overview.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Profile Completeness</h3>
          </div>
          <div className="card-content">
            <div className="progress-circle">
              <span className="progress-text">{candidate?.profileCompleteness || 0}%</span>
            </div>
            <p className="card-description">Complete your profile to attract more employers</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Applications</h3>
          </div>
          <div className="card-content">
            <div className="stat-number">{appsCount}</div>
            <p className="card-description">Active job applications</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Profile Views</h3>
          </div>
          <div className="card-content">
            <div className="stat-number">0</div>
            <p className="card-description">Views this month</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Job Matches</h3>
          </div>
          <div className="card-content">
            <JobsPreview />
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          {Object.keys(appsByStatus).length === 0 ? (
            <div className="activity-item">
              <div className="activity-icon">📄</div>
              <div className="activity-content">
                <div className="activity-title">No applications yet</div>
                <div className="activity-time">Apply to a job to get started</div>
              </div>
            </div>
          ) : (
            Object.entries(appsByStatus).slice(0, 3).map(([status, count]) => (
              <div className="activity-item" key={status}>
                <div className="activity-icon">📄</div>
                <div className="activity-content">
                  <div className="activity-title">{statusLabel(status)}: {count}</div>
                  <div className="activity-time">Updated recently</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function JobsPreview() {
  const [items, setItems] = useState([])
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr("")
      try {
        // Try personalized matches first
        let res
        try {
          res = await jobService.searchWithMatching({})
        } catch (e) {
          res = await jobService.listPublic()
        }
        if (cancelled) return
        const list = Array.isArray(res) ? res : []
        // Normalize like JobMatches does
        const normalized = list.map((it, idx) => {
          const j = it?.job || it
          return {
            id: j?.id || j?.jobPostId || `job-${idx}`,
            title: j?.title || j?.jobTitle || 'Role',
            company: j?.companyName || j?.company || 'Company',
            location: j?.location || j?.jobLocation || '—'
          }
        }).slice(0, 3)
        setItems(normalized)
      } catch (e2) {
        if (cancelled) return
        setErr(e2?.message || 'Failed to load jobs')
        setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className="muted">Loading jobs…</div>
  if (err) return <div className="error-banner">{err}</div>
  if (!items.length) return <div className="muted">No jobs to show</div>

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((j) => (
          <li key={j.id} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{j.title}</div>
            <div className="muted">{j.company} • {j.location}</div>
          </li>
        ))}
      </ul>
      <a href="/candidate-jobs" className="btn btn-secondary" style={{ marginTop: 8, display: 'inline-block' }}>View all jobs</a>
    </div>
  )
}

const SetupView = ({ candidate, onUpdate }) => {
  return (
    <div className="profile-form-container">
      <div className="profile-form-header">
        <h1 className="form-title">Complete Your Profile</h1>
        <p className="form-description">Help employers find you by completing your professional profile</p>
      </div>
      <ProfileSetupForm candidate={candidate} onUpdate={onUpdate} />
    </div>
  )
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase()
  if (s.includes("hire")) return "Hired"
  if (s.includes("interview")) return "Interview"
  if (s.includes("shortlist")) return "Shortlisted"
  if (s.includes("under") && s.includes("review")) return "Under Review"
  if (s.includes("reject")) return "Rejected"
  if (s.includes("submit")) return "Submitted"
  if (s.includes("apply")) return "Applied"
  return status || "Applied"
}
