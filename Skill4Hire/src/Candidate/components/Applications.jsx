"use client"

import { useEffect, useMemo, useState } from "react"
import { candidateService } from "../../services/candidateService"
import "../base.css"
import "./Applications.css"

const fallbackData = [
  {
    id: "ex-1",
    company: "TechNova Labs",
    role: "Frontend Developer",
    location: "Remote - North America",
    appliedDate: "2025-09-12",
    status: "Applied",
    lastUpdate: "2025-09-15",
  },
  {
    id: "ex-2",
    company: "BrightPixel Studio",
    role: "UI/UX Designer",
    location: "Austin, TX",
    appliedDate: "2025-08-29",
    status: "Shortlisted",
    lastUpdate: "2025-09-02",
  },
  {
    id: "ex-3",
    company: "CloudScale Inc.",
    role: "Full Stack Engineer",
    location: "New York, NY",
    appliedDate: "2025-08-18",
    status: "Rejected",
    lastUpdate: "2025-08-27",
  },
  {
    id: "ex-4",
    company: "Apex Analytics",
    role: "Data Analyst",
    location: "London, UK",
    appliedDate: "2025-09-05",
    status: "Under Review",
    lastUpdate: "2025-09-11",
  },
]
export default function Applications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await candidateService.getApplications()
        // Normalize to our expected shape if backend differs
        const normalized = (Array.isArray(res) ? res : []).map((a, i) => ({
          id: a.id || a._id || `app-${i}`,
          company: a.company || a.companyName || a.employer?.name || "Unknown",
          role: a.role || a.jobTitle || a.position || "Role not specified",
          location: a.location || a.jobLocation || "Location not provided",
          appliedDate: a.appliedDate || a.createdAt || a.dateApplied || "--",
          status: a.status || a.applicationStatus || "Submitted",
          lastUpdate: a.updatedAt || a.lastUpdate || a.modifiedAt || "--",
        }))
        if (isMounted) setApps(normalized.length ? normalized : fallbackData)
      } catch (error) {
        console.error("Failed to load applications:", error)
        if (isMounted) setApps(fallbackData)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return apps.filter((a) => {
      const matchesQuery = !q ||
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)
      const normalized = cls(a.status)
      const matchesStatus = statusFilter === "all" || normalized === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [apps, query, statusFilter])

  if (loading) {
    return <div className="loading">Loading your applications...</div>
  }

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
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">No applications match your search</td>
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
  if (s.includes("reject")) return "rejected"
  if (s.includes("offer")) return "offer"
  if (s.includes("interview") || s.includes("shortlist")) return "shortlisted"
  if (s.includes("review")) return "under-review"
  if (s.includes("apply")) return "submitted"
  return "submitted"
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase()
  if (s.includes("interview") || s.includes("shortlist")) return "Shortlisted"
  if (s.includes("under") && s.includes("review")) return "Under Review"
  if (s.includes("reject")) return "Rejected"
  if (s.includes("offer")) return "Offer"
  if (s.includes("submit")) return "Submitted"
  if (s.includes("apply")) return "Applied"
  return status || "Submitted"
}

