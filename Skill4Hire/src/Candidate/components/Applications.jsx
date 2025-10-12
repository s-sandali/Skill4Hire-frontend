"use client"

import { useEffect, useMemo, useState } from "react"
import { candidateService } from "../../services/candidateService"
import "../base.css"
import "./Applications.css"

export default function Applications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadApplications = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await candidateService.getApplications()
      const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : [])
      const normalized = list.map((a, i) => ({
        id: a.id || a._id || `app-${i}`,
        company: a.company || a.companyName || a.employer?.name || "Unknown",
        role: a.role || a.jobTitle || a.position || "Role not specified",
        location: a.location || a.jobLocation || "Location not provided",
        appliedDate: a.appliedDate || a.appliedAt || a.createdAt || a.dateApplied || "--",
        status: a.status || a.applicationStatus || "Applied",
        lastUpdate: a.updatedAt || a.lastUpdate || a.modifiedAt || a.appliedAt || "--",
      }))
      setApps(normalized)
    } catch (err) {
      console.error("Failed to load applications:", err)
      setError(err?.message || "Failed to load applications")
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await loadApplications()
    })()
    const onChanged = () => loadApplications()
    window.addEventListener('applications:changed', onChanged)
    return () => { window.removeEventListener('applications:changed', onChanged) }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return apps.filter((a) => {
      const matchesQuery = !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
      const normalized = cls(a.status)
      const matchesStatus = statusFilter === "all" || normalized === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [apps, query, statusFilter])

  return (
    <div className="applications-page">
      <div className="apps-header">
        <h1 className="apps-title">Applications</h1>
        <p className="apps-sub">Track each application and its latest status</p>
      </div>

      <div className="apps-controls">
        <div className="apps-search">
          <input
            className="apps-input"
            type="text"
            placeholder="Search companies or roles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="apps-filter">
          <select
            className="apps-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="applied">Applied</option>
            <option value="under-review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="offer">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn btn-secondary" onClick={loadApplications} disabled={loading} style={{ marginLeft: 8 }}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading">Loading your applications...</div>}

      <div className="apps-card">
        <div className="apps-table-wrapper">
          <table className="apps-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.company}</td>
                  <td>{a.role}</td>
                  <td className="muted">{a.location}</td>
                  <td className="muted">{fmt(a.appliedDate)}</td>
                  <td>
                    <span className={`status-badge ${cls(a.status)}`}>{statusLabel(a.status)}</span>
                  </td>
                  <td className="muted">{fmt(a.lastUpdate)}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">No applications match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function fmt(d) {
  if (!d || d === "--") return "--"
  try {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return d
    return date.toLocaleDateString()
  } catch {
    return d
  }
}

function cls(status) {
  const s = String(status || "").toLowerCase()
  if (s.includes("hire")) return "offer" // map Hired to offer style
  if (s.includes("interview")) return "interview" // custom mapping for filter; css may reuse shortlisted style
  if (s.includes("shortlist")) return "shortlisted"
  if (s.includes("reject")) return "rejected"
  if (s.includes("review")) return "under-review"
  if (s.includes("apply") || s.includes("submitted")) return "applied"
  return "applied"
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
