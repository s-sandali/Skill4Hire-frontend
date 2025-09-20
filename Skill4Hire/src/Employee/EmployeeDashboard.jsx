import { useState, useEffect } from 'react';
import { 
  RiUserLine, 
  RiBriefcaseLine, 
  RiFileList3Line, 
  RiCalendarScheduleLine,
  RiNotification3Line,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiSearchLine,
  RiFilterLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiDownloadLine
} from 'react-icons/ri';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample data
  const [employeeData] = useState({
    id: "emp-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Human Resources",
    position: "HR Manager",
    joinDate: "2022-03-15",
    status: "Active",
    avatar: null
  });

  const [candidates] = useState([
    {
      id: "cand-001",
      name: "Alex Chen",
      email: "alex.chen@email.com",
      position: "Frontend Developer",
      experience: "3 years",
      skills: ["React", "JavaScript", "CSS", "HTML"],
      status: "Interview Scheduled",
      appliedDate: "2024-01-15",
      matchScore: 95
    },
    {
      id: "cand-002",
      name: "Maria Rodriguez",
      email: "maria.rodriguez@email.com",
      position: "Backend Developer",
      experience: "5 years",
      skills: ["Node.js", "Python", "PostgreSQL", "AWS"],
      status: "Under Review",
      appliedDate: "2024-01-14",
      matchScore: 88
    },
    {
      id: "cand-003",
      name: "David Kim",
      email: "david.kim@email.com",
      position: "Full Stack Developer",
      experience: "4 years",
      skills: ["React", "Node.js", "MongoDB", "TypeScript"],
      status: "Hired",
      appliedDate: "2024-01-10",
      matchScore: 92
    }
  ]);

  const [jobs] = useState([
    {
      id: "job-001",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      status: "Active",
      applicants: 24,
      postedDate: "2024-01-10"
    },
    {
      id: "job-002",
      title: "Backend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      status: "Active",
      applicants: 18,
      postedDate: "2024-01-12"
    },
    {
      id: "job-003",
      title: "UI/UX Designer",
      department: "Design",
      location: "New York, NY",
      type: "Contract",
      status: "Closed",
      applicants: 12,
      postedDate: "2024-01-05"
    }
  ]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || candidate.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <RiBriefcaseLine />
              </div>
              <h1>Employee Dashboard</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <RiUserLine />
              </div>
              <div className="user-details">
                <span className="user-name">{employeeData.name}</span>
                <span className="user-role">{employeeData.position}</span>
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
          <RiUserLine /> Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          <RiFileList3Line /> Candidates
        </button>
        <button 
          className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <RiBriefcaseLine /> Job Postings
        </button>
        <button 
          className={`nav-tab ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          <RiCalendarScheduleLine /> Interviews
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
            <h2>Welcome back, {employeeData.name}!</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <RiFileList3Line />
                </div>
                <div className="stat-content">
                  <h3>{candidates.length}</h3>
                  <p>Total Candidates</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiBriefcaseLine />
                </div>
                <div className="stat-content">
                  <h3>{jobs.length}</h3>
                  <p>Active Jobs</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiCalendarScheduleLine />
                </div>
                <div className="stat-content">
                  <h3>5</h3>
                  <p>Upcoming Interviews</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <RiNotification3Line />
                </div>
                <div className="stat-content">
                  <h3>12</h3>
                  <p>New Applications</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="candidates-tab">
            <div className="tab-header">
              <h2>Candidate Management</h2>
              <div className="tab-actions">
                <div className="search-box">
                  <RiSearchLine />
                  <input 
                    type="text" 
                    placeholder="Search candidates..."
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
            <div className="candidates-grid">
              {filteredCandidates.map(candidate => (
                <div key={candidate.id} className="candidate-card">
                  <div className="candidate-header">
                    <div className="candidate-avatar">
                      <RiUserLine />
                    </div>
                    <div className="candidate-info">
                      <h3>{candidate.name}</h3>
                      <p>{candidate.position}</p>
                      <span className="match-score">{candidate.matchScore}% Match</span>
                    </div>
                    <div className="candidate-status">
                      <span className={`status-badge ${candidate.status.toLowerCase().replace(' ', '-')}`}>
                        {candidate.status}
                      </span>
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
                      <RiEditLine /> Edit
                    </button>
                  </div>
                </div>
              ))}
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
              {jobs.map(job => (
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

        {activeTab === 'interviews' && (
          <div className="interviews-tab">
            <h2>Interview Schedule</h2>
            <div className="interviews-list">
              <div className="interview-item">
                <div className="interview-time">
                  <span className="date">Jan 25, 2024</span>
                  <span className="time">10:00 AM</span>
                </div>
                <div className="interview-details">
                  <h3>Alex Chen - Frontend Developer</h3>
                  <p>Technical Interview - Round 2</p>
                  <span className="interview-type">Video Call</span>
                </div>
                <div className="interview-actions">
                  <button className="btn-primary">Join Meeting</button>
                  <button className="btn-secondary">Reschedule</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>Settings</h2>
            <div className="settings-sections">
              <div className="settings-section">
                <h3>Profile Settings</h3>
                <div className="setting-item">
                  <label>Name</label>
                  <input type="text" value={employeeData.name} />
                </div>
                <div className="setting-item">
                  <label>Email</label>
                  <input type="email" value={employeeData.email} />
                </div>
                <div className="setting-item">
                  <label>Department</label>
                  <input type="text" value={employeeData.department} />
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

export default EmployeeDashboard;
