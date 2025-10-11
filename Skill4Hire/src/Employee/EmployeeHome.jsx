"use client";

import "../Candidate/base.css";
import "../Candidate/buttons.css";
import "./EmployeeHome.css";

export default function EmployeeHome({ employee, onViewProfile, onViewDashboard }) {
    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">Welcome to Your Employee Dashboard</h1>
                <p className="home-description">
                    Manage your profile, refer candidates, track referrals, and access company tools
                    all in one place.
                </p>

                <div className="home-actions">
                    {/* use callback to switch tab to dashboard */}
                    <button
                        type="button"
                        className="btn btn-primary btn-large"
                        onClick={() => onViewDashboard?.()}
                    >
                        Go to Dashboard
                    </button>

                    {/* switch to profile */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-large"
                        onClick={() => onViewProfile?.()}
                    >
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
//error fixed//