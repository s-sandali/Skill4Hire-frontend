import React from 'react';
import { RiMapPinLine, RiMoneyDollarCircleLine, RiTimeLine, RiBriefcaseLine } from 'react-icons/ri';
import './JobPostings.css';

const JobPostings = () => {
  // Static demo job postings
  const demoJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120,000 - $150,000",
      description: "We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for developing user-facing features using modern JavaScript frameworks.",
      requirements: ["5+ years React experience", "TypeScript proficiency", "Modern CSS frameworks"],
      benefits: ["Health Insurance", "Remote Work", "Professional Development"],
      status: "active",
      applications: 28,
      shortlisted: 8,
      views: 156,
      postedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "UI/UX Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$80,000 - $110,000",
      description: "Join our design team to create intuitive and beautiful user experiences. Work closely with product managers and developers to bring designs to life.",
      requirements: ["3+ years UI/UX experience", "Figma expertise", "User research skills"],
      benefits: ["Flexible Hours", "Design Tools Budget", "Conference Attendance"],
      status: "active",
      applications: 42,
      shortlisted: 12,
      views: 203,
      postedDate: "2024-01-20"
    }
  ];

  return (
    <div className="job-postings">
      <div className="job-postings-header">
        <div className="header-left">
          <h2>Job Postings</h2>
          <p>Current active job listings</p>
        </div>
      </div>

      <div className="jobs-grid">
        {demoJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <div className="job-title-section">
                <h3>{job.title}</h3>
                <span className={`job-status ${job.status}`}>
                  {job.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="job-details">
              <div className="job-meta">
                <div className="meta-item">
                  <RiMapPinLine />
                  <span>{job.location}</span>
                </div>
                <div className="meta-item">
                  <RiBriefcaseLine />
                  <span>{job.type}</span>
                </div>
                <div className="meta-item">
                  <RiMoneyDollarCircleLine />
                  <span>{job.salary}</span>
                </div>
                <div className="meta-item">
                  <RiTimeLine />
                  <span>{job.department}</span>
                </div>
              </div>

              <p className="job-description">{job.description}</p>

              <div className="job-stats">
                <div className="stat">
                  <span className="stat-number">{job.applications}</span>
                  <span className="stat-label">Applications</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{job.shortlisted}</span>
                  <span className="stat-label">Shortlisted</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{job.views}</span>
                  <span className="stat-label">Views</span>
                </div>
              </div>
            </div>

            <div className="job-footer">
              <div className="job-footer-row">
                <div className="job-date">
                  Posted on {new Date(job.postedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button className="btn-outline">
                    View Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobPostings;