"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import CandidateLayout from "./components/CandidateLayout.jsx"
import CandidateHome from "./CandidateHome.jsx"
import { RiUserLine, RiFileTextLine, RiEyeLine, RiStarLine } from 'react-icons/ri'
import ProfileOverview from "./components/ProfileOverview.jsx"
import Applications from "./components/Applications.jsx"
import ProfileSetupForm from "./components/ProfileSetupForm.jsx"
import { candidateService } from "../services/candidateService.jsx"
import "./base.css"
import "./buttons.css"
import "./dashboard.css"

export default function CandidatePage() {
  const location = useLocation()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCandidateProfile()
  }, [])

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

  const getCurrentView = () => {
    const path = location.pathname
    
    if (path === "/candidate-dashboard") {
      return <DashboardView candidate={candidate} />
    } else if (path === "/candidate-profile") {
      return <ProfileOverview candidate={candidate} />
    } else if (path === "/candidate-applications") {
      return <Applications />
    } else if (path === "/candidate-setup") {
      return <SetupView candidate={candidate} onUpdate={fetchCandidateProfile} />
    } else if (path === "/candidate-home") {
      return <CandidateHome />
    }
    
    return <DashboardView candidate={candidate} />
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

  const DashboardView = ({ candidate }) => {
    const completeness = candidate?.profileCompleteness ?? 0
    const skillsCount = Array.isArray(candidate?.skills) ? candidate.skills.length : 0
    const applications = 0
    const views = 0
    const matches = 0
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's your career overview.</p>
        </div>
        {/* Tip banner to encourage profile completion (UI-only addition) */}
        <div className="promo-banner" role="region" aria-label="Profile visibility tip">
          <div className="promo-banner-content">
            <div className="promo-icon" aria-hidden="true">💡</div>
            <div className="promo-text">
              <h3 className="promo-title">Pro Tip: Boost Your Profile Visibility</h3>
              <p className="promo-desc">Profiles with portfolios and certifications get more views from recruiters. Complete these sections to stand out.</p>
            </div>
            <button className="promo-action" type="button" onClick={() => (window.location.href = '/candidate-setup')}>Complete Profile</button>
          </div>
          <button className="promo-close" type="button" aria-label="Dismiss tip" onClick={(e) => e.currentTarget.parentElement?.remove()}>×</button>
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
                <h3 className="card-title">Active Applications</h3>
              </div>
              <span className="stat-delta neutral">+3</span>
            </div>
            <div className="card-content">
              <div className="stat-number">{applications}</div>
              <p className="card-description">Job applications in progress</p>
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

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon-box orange"><RiStarLine /></div>
                <h3 className="card-title">Job Matches</h3>
              </div>
              <span className="stat-delta positive">+12</span>
            </div>
            <div className="card-content">
              <div className="stat-number">{matches}</div>
              <p className="card-description">New recommended positions</p>
            </div>
          </div>
        </div>

      <div className="dashboard-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📄</div>
            <div className="activity-content">
              <div className="activity-title">Profile created successfully</div>
              <div className="activity-time">Just now</div>
            </div>
          </div>
        </div>
      </div>
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
