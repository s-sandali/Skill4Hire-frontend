"use client";
import { useState, useEffect } from "react";
import {
  RiUserLine, RiBriefcaseLine, RiFileList3Line,
  RiCalendarScheduleLine, RiLogoutBoxLine,
  RiSearchLine, RiEyeLine, RiEditLine, RiAddLine, RiDeleteBinLine,
  RiNotification3Line
} from "react-icons/ri";
import EmployeeHome from "./EmployeeHome";
import EmployeeProfile from "./EmployeeProfile";
import { authService } from "../services/authService";
import { employeeService } from "../services/employeeService";

import "../Candidate/base.css";
import "../Candidate/buttons.css";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [loadingCompleteness, setLoadingCompleteness] = useState(false);
  const [completenessError, setCompletenessError] = useState(null);

  const goToProfile = () => setActiveTab("profile");
  const goToDashboard = () => setActiveTab("dashboard");

  const employeeData = {
    id: "emp-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    department: "Human Resources",
    position: "HR Manager",
    location: "San Francisco, CA",
    joinDate: "2022-03-15",
    status: "Active",
    skills: ["Recruitment", "Team Management"],
    bio: "Experienced HR Manager passionate about building inclusive workplaces."
  };

  const candidates = [
    { id:"cand-001", name:"Alex Chen", position:"Frontend Developer", status:"Interview Scheduled", experience:"3 years", matchScore:95, skills:["React","JavaScript","CSS","HTML"] },
    { id:"cand-002", name:"Maria Rodriguez", position:"Backend Developer", status:"Under Review", experience:"5 years", matchScore:88, skills:["Node.js","Python","PostgreSQL","AWS"] },
    { id:"cand-003", name:"David Kim", position:"Full Stack Developer", status:"Hired", experience:"4 years", matchScore:92, skills:["React","Node.js","MongoDB","TypeScript"] },
  ];

  const jobs = [
    { id:"job-001", title:"Senior Frontend Developer", department:"Engineering", location:"San Francisco, CA", type:"Full-time", status:"Active", applicants:24, postedDate:"2024-01-10" },
    { id:"job-002", title:"Backend Developer", department:"Engineering", location:"Remote", type:"Full-time", status:"Active", applicants:18, postedDate:"2024-01-12" },
    { id:"job-003", title:"UI/UX Designer", department:"Design", location:"New York, NY", type:"Contract", status:"Closed", applicants:12, postedDate:"2024-01-05" },
  ];

  const filteredCandidates = candidates.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.position.toLowerCase().includes(q);
    const matchesFilter = filterStatus === "all" || c.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Fetch profile completeness
  const fetchProfileCompleteness = async () => {
    setLoadingCompleteness(true);
    setCompletenessError(null);
    try {
      console.log("Fetching profile completeness...");
      const data = await employeeService.getProfileCompleteness();
      console.log("Completeness data received:", data);

      // Handle different response structures
      if (data.completenessPercentage !== undefined) {
        setProfileCompleteness(data.completenessPercentage);
      } else if (data.percentage !== undefined) {
        setProfileCompleteness(data.percentage);
      } else if (typeof data === 'number') {
        setProfileCompleteness(data);
      } else {
        console.warn("Unexpected completeness data structure:", data);
        setProfileCompleteness(0);
        setCompletenessError("Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching profile completeness:", error);
      setCompletenessError(error.message);
      setProfileCompleteness(0);
    } finally {
      setLoadingCompleteness(false);
    }
  };

  // Refresh completeness function
  const refreshCompleteness = () => {
    fetchProfileCompleteness();
  };

  // Fetch completeness on component mount
  useEffect(() => {
    fetchProfileCompleteness();
  }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    finally {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const dashboardMetrics = {
    totalCandidates: 3,
    activeJobs: 3,
    upcomingInterviews: 5,
    newApplications: 12,
  };

  // Progress ring style based on completeness
  const progressRingStyle = {
    background: `conic-gradient(#ff6a00 0% ${profileCompleteness}%, #f0f0f0 ${profileCompleteness}% 100%)`
  };

  const iconTileStyle = {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#ff8a00,#ff6a00)",
    boxShadow: "0 6px 18px rgba(255,122,0,.35)",
    margin: "0 auto .75rem",
  };

  return (
      <div className="employee-dashboard">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="brand">Employee</div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab==="home" ? "active":""}`} onClick={() => setActiveTab("home")}>
              <RiUserLine /> Home
            </button>
            <button className={`nav-item ${activeTab==="dashboard" ? "active":""}`} onClick={goToDashboard}>
              <RiUserLine /> Dashboard
            </button>
            <button className={`nav-item ${activeTab==="profile" ? "active":""}`} onClick={goToProfile}>
              <RiUserLine /> Profile
            </button>
            <button className={`nav-item ${activeTab==="candidates" ? "active":""}`} onClick={() => setActiveTab("candidates")}>
              <RiFileList3Line /> Candidates
            </button>
            <button className={`nav-item ${activeTab==="jobs" ? "active":""}`} onClick={() => setActiveTab("jobs")}>
              <RiBriefcaseLine /> Job Postings
            </button>
            <button className={`nav-item ${activeTab==="interviews" ? "active":""}`} onClick={() => setActiveTab("interviews")}>
              <RiCalendarScheduleLine /> Interviews
            </button>
          </nav>
          <button className="logout-btn" onClick={handleLogout}>
            <RiLogoutBoxLine /> Logout
          </button>
        </aside>

        {/* Main */}
        <main className="dashboard-main">
          {activeTab === "home" && (
              <EmployeeHome
                  employee={employeeData}
                  onViewProfile={goToProfile}
                  onViewDashboard={goToDashboard}
              />
          )}

          {/* DASHBOARD content with real completeness data */}
          {activeTab === "dashboard" && (
              <div className="dash-wrap">
                <div className="dash-hero cardish">
                  <h1 className="dash-title">Welcome back, {employeeData.name}!</h1>
                  <p className="dash-sub">Here's your overview.</p>
                </div>

                <div className="dash-grid">
                  {/* Profile Completeness - Now with real data */}
                  <div className="dash-card">
                    <div className="dash-card-head">
                      <h3>Profile<br/>Completeness</h3>
                    </div>

                    {loadingCompleteness ? (
                        <div className="pc-ring">
                          <div className="pc-badge">Loading...</div>
                        </div>
                    ) : completenessError ? (
                        <div className="pc-ring">
                          <div className="pc-badge error">Error</div>
                        </div>
                    ) : (
                        <>
                          <div className="pc-ring" style={progressRingStyle}>
                            <div className="pc-badge">{Math.round(profileCompleteness)}%</div>
                          </div>
                          <p className="dash-hint">
                            {profileCompleteness >= 100
                                ? "Profile complete! Great job!"
                                : `Complete your profile to attract more employers`}
                          </p>
                          {profileCompleteness < 100 && (
                              <button
                                  className="btn-complete-profile"
                                  onClick={goToProfile}
                                  style={{
                                    marginTop: '10px',
                                    padding: '8px 16px',
                                    background: '#ff6a00',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    width: '100%'
                                  }}
                              >
                                Complete Profile ({100 - Math.round(profileCompleteness)}% left)
                              </button>
                          )}
                        </>
                    )}

                    {completenessError && (
                        <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px' }}>
                          {completenessError}
                        </p>
                    )}
                  </div>

                  {/* Total Candidates */}
                  <div className="dash-card">
                    <div style={iconTileStyle}>
                      <RiFileList3Line size={26} color="#fff" />
                    </div>
                    <div className="metric">{dashboardMetrics.totalCandidates}</div>
                    <p className="muted center">Total Candidates</p>
                  </div>

                  {/* Active Jobs */}
                  <div className="dash-card">
                    <div style={iconTileStyle}>
                      <RiBriefcaseLine size={26} color="#fff" />
                    </div>
                    <div className="metric">{dashboardMetrics.activeJobs}</div>
                    <p className="muted center">Active Jobs</p>
                  </div>

                  {/* Upcoming Interviews */}
                  <div className="dash-card">
                    <div style={iconTileStyle}>
                      <RiCalendarScheduleLine size={26} color="#fff" />
                    </div>
                    <div className="metric">{dashboardMetrics.upcomingInterviews}</div>
                    <p className="muted center">Upcoming<br/>Interviews</p>
                  </div>

                  {/* New Applications */}
                  <div className="dash-card">
                    <div style={iconTileStyle}>
                      <RiNotification3Line size={26} color="#fff" />
                    </div>
                    <div className="metric">{dashboardMetrics.newApplications}</div>
                    <p className="muted center">New<br/>Applications</p>
                  </div>
                </div>

                <div className="dash-section">
                  <h2 className="dash-sec-title">Recent Activity</h2>
                  <div className="dash-divider" />

                  {/* Refresh button for testing */}
                  <button
                      onClick={refreshCompleteness}
                      style={{
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginTop: '10px'
                      }}
                  >
                    Refresh Completeness
                  </button>
                </div>
              </div>
          )}

          {activeTab === "profile" && (
              <EmployeeProfile
                  profileData={employeeData}
                  onProfileUpdate={refreshCompleteness}
              />
          )}

          {activeTab === "candidates" && (
              <div className="panel candidates-panel">
                <div className="panel-header">
                  <h2>Candidates</h2>
                  <div className="tools">
                    <div className="search">
                      <RiSearchLine />
                      <input
                          type="text"
                          placeholder="Search candidates..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="candidates-list">
                  {filteredCandidates.map((candidate) => (
                      <div key={candidate.id} className="candidate-card tall">
                        <div className="cand-header">
                          <div className="cand-left">
                            <div className="avatar-lg"><RiUserLine /></div>
                            <div className="cand-id">
                              <h3 className="cand-name">{candidate.name}</h3>
                              <div className="cand-role">{candidate.position}</div>
                              <span className="cand-match">{candidate.matchScore}% Match</span>
                            </div>
                          </div>
                          <span
                              className={
                                  "cand-status-badge " +
                                  candidate.status.toLowerCase().replace(/\s+/g, "-")
                              }
                          >
                      {candidate.status}
                    </span>
                        </div>

                        <div className="cand-experience">
                          <strong>Experience:</strong> <span className="years">{candidate.experience}</span>
                        </div>

                        <div className="cand-skills">
                          {candidate.skills?.map((s) => (
                              <span key={s} className="cand-skill">{s}</span>
                          ))}
                        </div>

                        <div className="cand-actions">
                          <button className="btn-cand-view" onClick={goToProfile}>
                            <RiEyeLine /> View Profile
                          </button>
                          <button className="btn-cand-edit">
                            <RiEditLine /> Edit
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {activeTab === "jobs" && (
              <div className="panel jobs-panel">
                <div className="jobs-header">
                  <h2 className="jobs-title">Job Postings</h2>
                  <button className="btn-post">
                    <RiAddLine /> Post New Job
                  </button>
                </div>

                <div className="cards-grid jobs-grid">
                  {jobs.map(job => (
                      <div key={job.id} className="card job-card">
                        <div className="job-card-top">
                          <h3 className="job-title">{job.title}</h3>
                          <span className={`job-status-badge ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                        </div>

                        <div className="job-meta">
                          <p><strong>Department:</strong> {job.department}</p>
                          <p><strong>Location:</strong> {job.location || "—"}</p>
                          <p><strong>Type:</strong> {job.type || "Full-time"}</p>
                          <p><strong>Applicants:</strong> {job.applicants}</p>
                          <p><strong>Posted:</strong> {job.postedDate}</p>
                        </div>

                        <div className="job-primary-action">
                          <button className="btn-view">
                            <RiEyeLine /> View Details
                          </button>
                        </div>

                        <div className="job-secondary-actions">
                          <button className="btn-edit-outline">
                            <RiEditLine /> Edit
                          </button>
                          <button className="btn-delete-outline">
                            <RiDeleteBinLine /> Delete
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {activeTab === "interviews" && (
              <div className="panel">
                <h2>Interview Schedule</h2>
                <div className="interview-card">
                  <div className="interview-left">
                    <span className="interview-date">Jan 25, 2024</span>
                    <span className="interview-time">10:00 AM</span>
                  </div>
                  <div className="interview-mid">
                    <h3 className="interview-title">Alex Chen - Frontend Developer</h3>
                    <p className="interview-sub">Technical Interview - Round 2</p>
                    <span className="interview-chip">Video Call</span>
                  </div>
                  <div className="interview-right">
                    <button className="btn-join">Join Meeting</button>
                    <button className="btn-reschedule">Reschedule</button>
                  </div>
                </div>
              </div>
          )}
        </main>
      </div>
  );
};

export default EmployeeDashboard;