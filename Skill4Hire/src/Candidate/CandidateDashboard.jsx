"use client"

import { useEffect, useState } from "react"
import { RiUserLine, RiFileTextLine, RiEyeLine, RiStarLine } from 'react-icons/ri'
import { candidateService } from "../services/candidateService.jsx"
import "./base.css"
import "./buttons.css"
import "./dashboard.css"
import "./candidate.css"

// Lean dashboard content only. Navigation and other sections
// live in Candidate/components/CandidateLayout and dedicated pages.
export default function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const profile = await candidateService.getProfile()
        if (mounted) setCandidate(profile)
      } catch (err) {
        console.error("Error fetching profile:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="loading">Loading your dashboard...</div>

  const completeness = candidate?.profileCompleteness ?? 0
  const skillsCount = Array.isArray(candidate?.skills) ? candidate.skills.length : 0
  const applications = 0
  const views = 0
  const matches = 0

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's your overview.</p>
      </div>

      <div className="promo-banner" role="region" aria-label="Profile visibility tip">
        <div className="promo-banner-content">
          <div className="promo-icon" aria-hidden="true">💡</div>
          <div className="promo-text">
            <h3 className="promo-title">Pro Tip: Boost Your Profile Visibility</h3>
            <p className="promo-desc">Profiles with portfolios and certifications get more views from recruiters. Complete these sections to stand out.</p>
          </div>
          <button className="promo-action" type="button" onClick={() => (window.location.href = '/candidate-setup')}>Complete Profile</button>
        </div>
        <button className="promo-close" type="button" aria-label="Dismiss tip" onClick={(e) => e.currentTarget.parentElement?.remove()}>✕</button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon-box blue"><RiUserLine /></div>
              <h3 className="card-title">Profile Completeness</h3>
            </div>
            <span className="stat-delta positive">+15%</span>
          </div>
          <div className="card-content">
            <div className="progress-circle">
              <span className="progress-text">{completeness}%</span>
            </div>
            <p className="card-description">Complete your profile to attract employers</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon-box purple"><RiFileTextLine /></div>
              <h3 className="card-title">Skills</h3>
            </div>
            <span className="stat-delta neutral">+3</span>
          </div>
          <div className="card-content">
            <div className="stat-number">{skillsCount}</div>
            <p className="card-description">Skills listed on your profile</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon-box orange"><RiStarLine /></div>
              <h3 className="card-title">Applications</h3>
            </div>
            <span className="stat-delta neutral">+0</span>
          </div>
          <div className="card-content">
            <div className="stat-number">{applications}</div>
            <p className="card-description">Active job applications</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-header-left">
              <div className="card-icon-box green"><RiEyeLine /></div>
              <h3 className="card-title">Profile Views</h3>
            </div>
            <span className="stat-delta positive">+48</span>
          </div>
          <div className="card-content">
            <div className="stat-number">{views}</div>
            <p className="card-description">Views this month</p>
          </div>
        </div>
      </div>
    </div>
  )
}
