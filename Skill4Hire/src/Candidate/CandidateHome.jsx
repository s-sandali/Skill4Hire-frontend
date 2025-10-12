"use client"

import { Link } from "react-router-dom"
import "./base.css"
import "./buttons.css"

export default function CandidateHome() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to Your Career Dashboard</h1>
        <p className="home-description">
          Manage your professional profile, track applications, and discover new opportunities.
        </p>
        <div className="home-actions">
          <Link to="/candidate-dashboard" className="btn btn-primary btn-large">
            Go to Dashboard
          </Link>
          <Link to="/candidate-profile" className="btn btn-secondary btn-large">
            View Profile
          </Link>
          <Link to="/candidate-jobs" className="btn btn-primary btn-large">
            Find Jobs & Matches
          </Link>
        </div>
      </div>
    </div>
  )
}
