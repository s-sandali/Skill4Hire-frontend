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
    } else if (path === "/candidate-jobs" || path === "/candidate-matches") {
      return <JobMatches />
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
            <div className="stat-number">0</div>
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
            <div className="stat-number">0</div>
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
