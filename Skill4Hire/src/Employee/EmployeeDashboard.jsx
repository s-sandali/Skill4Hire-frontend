"use client";
import { useState, useEffect, useCallback } from "react";
import {
  RiUserLine, RiBriefcaseLine, RiFileList3Line,
  RiCalendarScheduleLine, RiLogoutBoxLine,
  RiSearchLine, RiEyeLine, RiThumbUpLine,
  RiNotification3Line, RiRefreshLine
} from "react-icons/ri";
import EmployeeHome from "./EmployeeHome";
import EmployeeProfile from "./EmployeeProfile";
import RecommendationModal from "./RecommendationModal";
import CandidateDetailsModal from "./CandidateDetailsModal";
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

  // Real data states
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    upcomingInterviews: 0,
    newApplications: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  // Candidate details modal state
  const [candidateDetailsModalOpen, setCandidateDetailsModalOpen] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  // Per-job recommendations state
  const [jobRecsModalOpen, setJobRecsModalOpen] = useState(false);
  const [selectedJobForRecs, setSelectedJobForRecs] = useState(null);
  const [jobRecs, setJobRecs] = useState([]);
  const [jobRecsLoading, setJobRecsLoading] = useState(false);
  const [jobRecsError, setJobRecsError] = useState("");

  const goToProfile = () => setActiveTab("profile");
  const goToDashboard = () => setActiveTab("dashboard");

  // Fetch employee profile
  const fetchEmployeeProfile = useCallback(async () => {
    try {
      const data = await employeeService.getProfile();
      setEmployeeData(data);
    } catch (error) {
      console.error("Error fetching employee profile:", error);
    }
  }, []);

  // Fetch profile completeness
  const fetchProfileCompleteness = useCallback(async () => {
    setLoadingCompleteness(true);
    setCompletenessError(null);
    try {
      const data = await employeeService.getProfileCompleteness();

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
  }, []);

  // Fetch candidates with filters
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeService.searchCandidates({
        skill: searchTerm || null,
        minExperience: filterStatus !== 'all' && filterStatus !== 'experience' ? parseInt(filterStatus, 10) : null,
        page: 0,
        size: 10
      });
      setCandidates(data.content || data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  // Fetch active jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeService.getActiveJobs(0, 10);
      setJobs(data.content || data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch employee's recommendations
  const fetchMyRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeService.getMyRecommendations(0, 10);
      setRecommendations(data.content || data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const data = await employeeService.getDashboardMetrics();
      setDashboardMetrics(data);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchEmployeeProfile();
    fetchProfileCompleteness();
  }, [fetchEmployeeProfile, fetchProfileCompleteness]);

  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates();
    }
  }, [activeTab, fetchCandidates]);

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    }
  }, [activeTab, fetchJobs]);

  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchMyRecommendations();
    }
  }, [activeTab, fetchMyRecommendations]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardMetrics();
    }
  }, [activeTab, fetchDashboardMetrics]);

  // Handle candidate recommendation
  const handleRecommendCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowRecommendModal(true);
  };

  // Submit recommendation
  const submitRecommendation = async (jobId, note) => {
    try {
      await employeeService.recommendCandidate({
        candidateId: selectedCandidate.userId || selectedCandidate.id,
        jobId: jobId,
        note: note
      });
      setShowRecommendModal(false);
      setSelectedCandidate(null);
      alert('Candidate recommended successfully!');
      fetchMyRecommendations(); // Refresh recommendations
    } catch (error) {
      alert('Error recommending candidate: ' + error.message);
    }
  };

  // View candidate details
  const handleViewCandidate = async (candidateId) => {
    try {
      const candidate = await employeeService.getCandidateProfile(candidateId);
      setCandidateDetails(candidate);
      setCandidateDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      alert('Error loading candidate details');
    }
  };

  // Download candidate CV
  const handleDownloadCv = async (candidateId) => {
    try {
      const { blob, filename } = await employeeService.downloadCandidateCv(candidateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Failed to download CV');
    }
  };

  // Open per-job recommendations modal and load data
  const openJobRecommendations = async (job) => {
    if (!job?.id) return;
    setSelectedJobForRecs(job);
    setJobRecsModalOpen(true);
    setJobRecs([]);
    setJobRecsError("");
    setJobRecsLoading(true);
    try {
      const data = await employeeService.getJobRecommendations(job.id, 0, 20);
      const list = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
      setJobRecs(list);
    } catch (err) {
      setJobRecsError(err?.message || 'Failed to load recommendations for this job');
      setJobRecs([]);
    } finally {
      setJobRecsLoading(false);
    }
  };

  const closeJobRecommendations = () => {
    setJobRecsModalOpen(false);
    setSelectedJobForRecs(null);
    setJobRecs([]);
    setJobRecsError("");
  };

  // Logout handler (used by sidebar button)
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  // Progress ring style based on completeness
  const progressRingStyle = {
    background: `conic-gradient(#ff6a00 0% ${profileCompleteness}%, #2a2b5a ${profileCompleteness}% 100%)`
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
              <RiBriefcaseLine /> Jobs
            </button>
            <button className={`nav-item ${activeTab==="recommendations" ? "active":""}`} onClick={() => setActiveTab("recommendations")}>
              <RiThumbUpLine /> My Recommendations
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

          {/* DASHBOARD content with real data */}
          {activeTab === "dashboard" && (
              <div className="dash-wrap">
                <div className="dash-hero cardish">
                  <h1 className="dash-title">
                    Welcome back, {employeeData?.name || 'Employee'}!
                  </h1>
                  <p className="dash-sub">Here's your overview.</p>
                </div>

                <div className="dash-grid">
                  {/* Profile Completeness */}
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
                              >
                                Complete Profile ({100 - Math.round(profileCompleteness)}% left)
                              </button>
                          )}
                        </>
                    )}

                    {completenessError && (
                        <p className="error-message">
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
                </div>

                <div className="dash-section">
                  <h2 className="dash-sec-title">Recent Activity</h2>
                  <div className="dash-divider" />

                  {/* Refresh buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={fetchProfileCompleteness}
                        className="btn btn-secondary"
                    >
                      <RiRefreshLine /> Refresh Completeness
                    </button>
                    <button
                        onClick={fetchDashboardMetrics}
                        className="btn btn-secondary"
                    >
                      <RiRefreshLine /> Refresh Metrics
                    </button>
                  </div>
                </div>
              </div>
          )}

          {activeTab === "profile" && (
              <EmployeeProfile
                  onProfileUpdate={fetchProfileCompleteness}
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
                          placeholder="Search by skill..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                        className="select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Experience</option>
                      <option value="1">1+ years</option>
                      <option value="3">3+ years</option>
                      <option value="5">5+ years</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading candidates...</div>
                ) : (
                    <div className="candidates-list">
                      {candidates.length === 0 ? (
                          <div className="no-data">No candidates found</div>
                      ) : (
                          candidates.map((candidate) => (
                              <div key={candidate.id || candidate.userId} className="candidate-card tall">
                                <div className="cand-header">
                                  <div className="cand-left">
                                    <div className="avatar-lg">
                                      <RiUserLine />
                                    </div>
                                    <div className="cand-id">
                                      <h3 className="cand-name">{candidate.name}</h3>
                                      <div className="cand-role">{candidate.position || 'Candidate'}</div>
                                      <span className="cand-match">
                              {candidate.matchScore || 'N/A'}% Match
                            </span>
                                    </div>
                                  </div>
                                  <span className="cand-status-badge available">
                          Available
                        </span>
                                </div>

                                <div className="cand-experience">
                                  <strong>Experience:</strong>
                                  <span className="years">
                          {candidate.experience?.yearsOfExperience || 'Not specified'} years
                        </span>
                                </div>

                                <div className="cand-skills">
                                  {candidate.skills?.slice(0, 4).map((skill) => (
                                      <span key={skill} className="cand-skill">{skill}</span>
                                  ))}
                                  {candidate.skills?.length > 4 && (
                                      <span className="cand-skill">+{candidate.skills.length - 4} more</span>
                                  )}
                                </div>

                                <div className="cand-actions">
                                  <button
                                      className="btn-cand-view"
                                      onClick={() => handleViewCandidate(candidate.id || candidate.userId)}
                                  >
                                    <RiEyeLine /> View Profile
                                  </button>
                                  <button
                                      className="btn-cand-edit"
                                      onClick={() => handleRecommendCandidate(candidate)}
                                  >
                                    <RiThumbUpLine /> Recommend
                                  </button>
                                  <button
                                      className="btn-cand-edit"
                                      onClick={() => handleDownloadCv(candidate.id || candidate.userId)}
                                  >
                                    📄 Download CV
                                  </button>
                                </div>
                              </div>
                          ))
                      )}
                    </div>
                )}
              </div>
          )}

          {activeTab === "jobs" && (
              <div className="panel jobs-panel">
                <div className="jobs-header">
                  <h2 className="jobs-title">Active Job Postings</h2>
                  <button
                      className="btn-refresh"
                      onClick={fetchJobs}
                      disabled={loading}
                  >
                    <RiRefreshLine /> Refresh
                  </button>
                </div>

                {loading ? (
                    <div className="loading-state">Loading jobs...</div>
                ) : (
                    <div className="cards-grid jobs-grid">
                      {jobs.length === 0 ? (
                          <div className="no-data">No active jobs found</div>
                      ) : (
                          jobs.map(job => (
                              <div key={job.id} className="card job-card">
                                <div className="job-card-top">
                                  <h3 className="job-title">{job.title}</h3>
                                  <span className={`job-status-badge ${job.status?.toLowerCase()}`}>
                          {job.status || 'Active'}
                        </span>
                                </div>

                                <div className="job-meta">
                                  <p><strong>Department:</strong> {job.department || 'Not specified'}</p>
                                  <p><strong>Location:</strong> {job.location || 'Remote'}</p>
                                  <p><strong>Type:</strong> {job.type || 'Full-time'}</p>
                                  <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="job-primary-action">
                                  <button className="btn-view">
                                    <RiEyeLine /> View Details
                                  </button>
                                  <button
                                    className="btn-refresh"
                                    onClick={() => openJobRecommendations(job)}
                                  >
                                    <RiThumbUpLine /> View Recommendations
                                  </button>
                                </div>
                              </div>
                          ))
                      )}
                    </div>
                )}
              </div>
          )}

          {activeTab === "recommendations" && (
              <div className="panel recommendations-panel">
                <div className="panel-header">
                  <h2>My Recommendations</h2>
                  <button
                      className="btn-refresh"
                      onClick={fetchMyRecommendations}
                      disabled={loading}
                  >
                    <RiRefreshLine /> Refresh
                  </button>
                </div>

                {loading ? (
                    <div className="loading-state">Loading recommendations...</div>
                ) : (
                    <div className="recommendations-list">
                      {recommendations.length === 0 ? (
                          <div className="no-data">No recommendations yet</div>
                      ) : (
                          recommendations.map(rec => (
                              <div key={rec.id} className="recommendation-card">
                                <div className="rec-header">
                                  <h4>Recommendation for {rec.candidateName || 'Candidate'}</h4>
                                  <span className={`rec-status ${rec.status?.toLowerCase()}`}>
                          {rec.status}
                        </span>
                                </div>
                                <p><strong>Job:</strong> {rec.jobTitle || 'Unknown Job'}</p>
                                <p><strong>Note:</strong> {rec.note || 'No note provided'}</p>
                                <p><strong>Date:</strong> {new Date(rec.createdAt).toLocaleDateString()}</p>
                              </div>
                          ))
                      )}
                    </div>
                )}
              </div>
          )}
        </main>

        {/* Recommendation Modal */}
        <RecommendationModal
            isOpen={showRecommendModal}
            onClose={() => {
              setShowRecommendModal(false);
              setSelectedCandidate(null);
            }}
            candidate={selectedCandidate}
            jobs={jobs}
            onSubmit={submitRecommendation}
        />

        {/* Candidate Details Modal */}
        <CandidateDetailsModal
          isOpen={candidateDetailsModalOpen}
          onClose={() => { setCandidateDetailsModalOpen(false); setCandidateDetails(null); }}
          candidate={candidateDetails}
          onDownloadCv={() => candidateDetails && handleDownloadCv(candidateDetails.id || candidateDetails.userId)}
          onRecommend={() => {
            if (!candidateDetails) return;
            // Ensure jobs list is available
            if (!jobs || jobs.length === 0) {
              fetchJobs().then(() => {
                setSelectedCandidate(candidateDetails);
                setShowRecommendModal(true);
                setCandidateDetailsModalOpen(false);
              });
            } else {
              setSelectedCandidate(candidateDetails);
              setShowRecommendModal(true);
              setCandidateDetailsModalOpen(false);
            }
          }}
        />

        {/* Job Recommendations Modal */}
        {jobRecsModalOpen && (
          <div className="modal-overlay" onClick={closeJobRecommendations}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Recommendations for: {selectedJobForRecs?.title}</h3>
                <button className="close-btn" onClick={closeJobRecommendations}>×</button>
              </div>
              <div className="modal-body">
                {jobRecsLoading && <div className="loading-state">Loading...</div>}
                {!jobRecsLoading && jobRecsError && (
                  <div className="error-message">{jobRecsError}</div>
                )}
                {!jobRecsLoading && !jobRecsError && jobRecs.length === 0 && (
                  <div className="no-data">No recommendations yet for this job.</div>
                )}
                {!jobRecsLoading && !jobRecsError && jobRecs.length > 0 && (
                  <div className="recommendations-list">
                    {jobRecs.map((rec, idx) => (
                      <div key={rec.id || idx} className="recommendation-card">
                        <div className="rec-header">
                          <h4>{rec.candidateName || rec.candidate?.name || 'Candidate'}</h4>
                          {rec.status && (
                            <span className={`rec-status ${String(rec.status).toLowerCase()}`}>{rec.status}</span>
                          )}
                        </div>
                        <p><strong>Job:</strong> {rec.jobTitle || selectedJobForRecs?.title}</p>
                        {rec.note && <p><strong>Note:</strong> {rec.note}</p>}
                        {rec.createdAt && (
                          <p><strong>Date:</strong> {new Date(rec.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default EmployeeDashboard;
