import { useState } from 'react';
import {
  RiBuildingLine,
  RiBriefcaseLine,
  RiUserLine,
  RiFileList3Line,
  RiBarChartBoxLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiSearchLine,
  RiFilterLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiDownloadLine,
  RiCalendarScheduleLine,
  RiNotification3Line
} from 'react-icons/ri';
import { authService } from '../services/authService';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample data
  const [companyData] = useState({
    id: "comp-001",
    name: "TechCorp Solutions",
    email: "hr@techcorp.com",
    industry: "Technology",
    size: "100-500 employees",
    location: "San Francisco, CA",
    founded: "2018",
    status: "Active"
  });

  const [jobPostings] = useState([
    {
      id: "job-001",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      status: "Active",
      applicants: 24,
      postedDate: "2024-01-10",
      salary: "$120,000 - $150,000",
      experience: "5+ years"
    },
    {
      id: "job-002",
      title: "Backend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      status: "Active",
      applicants: 18,
      postedDate: "2024-01-12",
      salary: "$100,000 - $130,000",
      experience: "3+ years"
    },
    {
      id: "job-003",
      title: "UI/UX Designer",
      department: "Design",
      location: "New York, NY",
      type: "Contract",
      status: "Closed",
      applicants: 12,
      postedDate: "2024-01-05",
      salary: "$80,000 - $100,000",
      experience: "2+ years"
    }
  ]);

  const [applications] = useState([
    {
      id: "app-001",
      candidateName: "Alex Chen",
      candidateEmail: "alex.chen@email.com",
      jobTitle: "Senior Frontend Developer",
      appliedDate: "2024-01-15",
      status: "Under Review",
      experience: "5 years",
      skills: ["React", "JavaScript", "TypeScript", "Node.js"],
      matchScore: 95
    },
    {
      id: "app-002",
      candidateName: "Maria Rodriguez",
      candidateEmail: "maria.rodriguez@email.com",
      jobTitle: "Backend Developer",
      appliedDate: "2024-01-14",
      status: "Interview Scheduled",
      experience: "4 years",
      skills: ["Python", "Django", "PostgreSQL", "AWS"],
      matchScore: 88
    },
    {
      id: "app-003",
      candidateName: "David Kim",
      candidateEmail: "david.kim@email.com",
      jobTitle: "Full Stack Developer",
      appliedDate: "2024-01-10",
      status: "Hired",
      experience: "6 years",
      skills: ["React", "Node.js", "MongoDB", "Docker"],
      matchScore: 92
    }
  ]);

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || application.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Clear local storage and redirect regardless of API call success
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('rememberedEmail');
      window.location.href = '/login';
    }
  };

  return (
    <div className="company-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <RiBuildingLine />
              </div>
              <h1>Company Dashboard</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <RiBuildingLine />
              </div>
              <div className="user-details">
                <span className="user-name">{companyData.name}</span>
                <span className="user-role">{companyData.industry}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <RiLogoutBoxLine />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <RiBarChartBoxLine /> Overview
        </button>
        <button
          className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <RiBriefcaseLine /> Job Postings
        </button>
        <button
          className={`nav-tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <RiFileList3Line /> Applications
        </button>
        <button
          className={`nav-tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          <RiUserLine /> Candidates
        </button>
        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <RiBarChartBoxLine /> Analytics
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <RiSettingsLine /> Settings
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h2>Welcome back, {companyData.name}!</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <RiBriefcaseLine />
                </div>
                <div className="stat-content">
                  <h3>{jobPostings.length}</h3>
                  <p>Active Job Postings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiFileList3Line />
                </div>
                <div className="stat-content">
                  <h3>{applications.length}</h3>
                  <p>Total Applications</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiUserLine />
                </div>
                <div className="stat-content">
                  <h3>12</h3>
                  <p>New Candidates This Week</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiNotification3Line />
                </div>
                <div className="stat-content">
                  <h3>5</h3>
                  <p>Interviews Scheduled</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="jobs-tab">
            <div className="tab-header">
              <h2>Job Postings</h2>
              <button className="btn-primary">
                <RiAddLine /> Post New Job
              </button>
            </div>
            <div className="jobs-grid">
              {jobPostings.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="job-details">
                    <p><strong>Department:</strong> {job.department}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Type:</strong> {job.type}</p>
                    <p><strong>Experience:</strong> {job.experience}</p>
                    <p><strong>Salary:</strong> {job.salary}</p>
                    <p><strong>Applicants:</strong> {job.applicants}</p>
                    <p><strong>Posted:</strong> {job.postedDate}</p>
                  </div>
                  <div className="job-actions">
                    <button className="btn-primary">
                      <RiEyeLine /> View Details
                    </button>
                    <button className="btn-secondary">
                      <RiEditLine /> Edit
                    </button>
                    <button className="btn-danger">
                      <RiDeleteBinLine /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-tab">
            <div className="tab-header">
              <h2>Job Applications</h2>
              <div className="tab-actions">
                <div className="search-box">
                  <RiSearchLine />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="review">Under Review</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="applications-grid">
              {filteredApplications.map(application => (
                <div key={application.id} className="application-card">
                  <div className="application-header">
                    <div className="candidate-avatar">
                      <RiUserLine />
                    </div>
                    <div className="candidate-info">
                      <h3>{application.candidateName}</h3>
                      <p>{application.jobTitle}</p>
                      <span className="match-score">{application.matchScore}% Match</span>
                    </div>
                    <div className="application-status">
                      <span className={`status-badge ${application.status.toLowerCase().replace(' ', '-')}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                  <div className="application-details">
                    <p><strong>Experience:</strong> {application.experience}</p>
                    <p><strong>Applied:</strong> {application.appliedDate}</p>
                    <div className="skills-list">
                      {application.skills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="application-actions">
                    <button className="btn-primary">
                      <RiEyeLine /> View Profile
                    </button>
                    <button className="btn-secondary">
                      <RiCalendarScheduleLine /> Schedule Interview
                    </button>
                    <button className="btn-danger">
                      <RiDeleteBinLine /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="candidates-tab">
            <h2>Candidate Pool</h2>
            <div className="candidates-grid">
              {applications.map(candidate => (
                <div key={candidate.id} className="candidate-card">
                  <div className="candidate-header">
                    <div className="candidate-avatar">
                      <RiUserLine />
                    </div>
                    <div className="candidate-info">
                      <h3>{candidate.candidateName}</h3>
                      <p>{candidate.jobTitle}</p>
                      <span className="match-score">{candidate.matchScore}% Match</span>
                    </div>
                  </div>
                  <div className="candidate-details">
                    <p><strong>Experience:</strong> {candidate.experience}</p>
                    <div className="skills-list">
                      {candidate.skills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="candidate-actions">
                    <button className="btn-primary">
                      <RiEyeLine /> View Profile
                    </button>
                    <button className="btn-secondary">
                      <RiDownloadLine /> Download Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <h2>Analytics & Reports</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Application Trends</h3>
                <div className="chart-placeholder">
                  <p>Chart visualization would go here</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Hiring Funnel</h3>
                <div className="chart-placeholder">
                  <p>Funnel visualization would go here</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Top Skills</h3>
                <div className="skills-chart">
                  <div className="skill-bar">
                    <span>React</span>
                    <div className="bar">
                      <div className="fill" style={{width: '85%'}}></div>
                    </div>
                    <span>85%</span>
                  </div>
                  <div className="skill-bar">
                    <span>JavaScript</span>
                    <div className="bar">
                      <div className="fill" style={{width: '78%'}}></div>
                    </div>
                    <span>78%</span>
                  </div>
                  <div className="skill-bar">
                    <span>Python</span>
                    <div className="bar">
                      <div className="fill" style={{width: '65%'}}></div>
                    </div>
                    <span>65%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>Company Settings</h2>
            <div className="settings-sections">
              <div className="settings-section">
                <h3>Company Information</h3>
                <div className="setting-item">
                  <label>Company Name</label>
                  <input type="text" value={companyData.name} />
                </div>
                <div className="setting-item">
                  <label>Email</label>
                  <input type="email" value={companyData.email} />
                </div>
                <div className="setting-item">
                  <label>Industry</label>
                  <input type="text" value={companyData.industry} />
                </div>
                <div className="setting-item">
                  <label>Location</label>
                  <input type="text" value={companyData.location} />
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyDashboard;