"use client";
import { useState, useEffect, useCallback } from "react";
import {
  RiUserLine, RiBriefcaseLine, RiFileList3Line,
  RiCalendarScheduleLine, RiLogoutBoxLine,
  RiSearchLine, RiEyeLine, RiThumbUpLine,
  RiNotification3Line, RiRefreshLine,
  RiDashboardLine
} from "react-icons/ri";
import EmployeeProfile from "./EmployeeProfile";
import RecommendationModal from "./RecommendationModal";
import CandidateDetailsModal from "./CandidateDetailsModal";
import EmployeeNotifications from "./EmployeeNotifications";
import PortalLogoBadge from "../components/PortalLogoBadge.jsx";
import { authService } from "../services/authService";
import { employeeService } from "../services/employeeService";
import apiClient from "../utils/axiosConfig";

import "../Candidate/base.css";
import "../Candidate/Profile.css";

const getAssetBaseUrl = () => {
  const base = apiClient?.defaults?.baseURL || "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const resolveAssetUrl = (raw, folder = "profile-pictures") => {
  if (!raw) return "";

  const stringValue = String(raw).trim();
  if (!stringValue) return "";

  const normalized = stringValue.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const base = getAssetBaseUrl();

  if (normalized.startsWith("/api/uploads/")) {
    const stripped = normalized.replace(/^\/api/, "");
    return base ? `${base}${stripped}` : stripped;
  }

  if (normalized.startsWith("/uploads/")) {
    return base ? `${base}${normalized}` : normalized;
  }

  if (normalized.startsWith("uploads/")) {
    return base ? `${base}/${normalized}` : `/${normalized}`;
  }

  if (normalized.startsWith(`${folder}/`)) {
    const path = `/uploads/${normalized}`;
    return base ? `${base}${path}` : path;
  }

  if (normalized.startsWith("/")) {
    return base ? `${base}${normalized}` : normalized;
  }

  const suffix = normalized.replace(/^\/+/g, "");
  const path = `/uploads/${folder}/${suffix}`;
  return base ? `${base}${path}` : path;
};

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
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
  const [candidateDetailsModalOpen, setCandidateDetailsModalOpen] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [jobRecsModalOpen, setJobRecsModalOpen] = useState(false);
  const [selectedJobForRecs, setSelectedJobForRecs] = useState(null);
  const [jobRecs, setJobRecs] = useState([]);
  const [jobRecsLoading, setJobRecsLoading] = useState(false);
  const [jobRecsError, setJobRecsError] = useState("");
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch employee profile
  const fetchEmployeeProfile = useCallback(async () => {
    try {
      const data = await employeeService.getProfile();
      const resolvedAvatar = resolveAssetUrl(data?.profilePictureUrl || data?.profilePicturePath);
      setEmployeeData({ ...data, profilePictureUrl: resolvedAvatar || data?.profilePictureUrl });
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

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
  const data = await employeeService.getUnreadNotificationCount();
  setUnreadNotifications(data?.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, []);

  // Fetch candidates with filters
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const minExperience = (filterStatus !== 'all' && filterStatus !== 'experience') ? parseInt(filterStatus, 10) : null;
      const data = await employeeService.searchCandidates({
        skill: searchTerm || null,
        minExperience,
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
    fetchNotificationCount();
  }, [fetchEmployeeProfile, fetchProfileCompleteness, fetchNotificationCount]);

  // Refresh notification count periodically
  useEffect(() => {
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

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
        candidateId: candidateDetails?.candidateId || selectedCandidate?.candidateId || selectedCandidate?.userId || selectedCandidate?.id,
        jobId: jobId,
        note: note
      });
      setShowRecommendModal(false);
      setSelectedCandidate(null);
      alert('Candidate recommended successfully!');
      fetchMyRecommendations();
    } catch (error) {
      alert('Error recommending candidate: ' + error.message);
    }
  };

  // View candidate details
  const handleViewCandidate = async (candidateId) => {
    try {
      const candidate = await employeeService.getCandidateProfile(candidateId);
      // normalize image URL for modal
      const normalized = { ...candidate, profilePictureUrl: getCandidateImageUrl(candidate) };
      setCandidateDetails(normalized);
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

  // Open per-job recommendations modal
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

  // Logout handler
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

  // Get employee initials for avatar
  const getEmployeeInitials = () => {
    if (!employeeData?.name) return 'E';
    const names = employeeData.name.split(' ');
    return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  const API_BASE = apiClient?.defaults?.baseURL || "";
  const toImageUrl = (url) => {
    if (!url) return "";
    if (/^(data:|blob:)/i.test(url)) return url; // leave data/blob URLs as-is
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    return `${API_BASE}/${url}`;
  };
  const getCandidateImageUrl = (c) => {
    const raw = c?.profilePictureUrl || c?.profilePicturePath || c?.profilePicture || c?.photoUrl || c?.avatarUrl || "";
    return toImageUrl(raw);
  };
  const getCompanyLogoUrl = (job) => {
    const raw = job?.companyLogo || job?.companyLogoUrl || job?.company?.logoUrl || job?.companyLogoPath || job?.company?.logoPath || job?.logoUrl || job?.logo || "";
    return toImageUrl(raw);
  };
  const getRecAvatarUrl = (rec) => {
    const raw = rec?.candidateProfilePictureUrl || rec?.candidateProfilePicturePath || rec?.candidate?.profilePictureUrl || rec?.candidate?.profilePicturePath || "";
    return toImageUrl(raw);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - Matching Candidate Profile */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <PortalLogoBadge size={76} imageScale={0.7} />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Skill4Hire</h1>
                  <p className="text-xs text-gray-600">Employee Portal</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Notifications"
                    onClick={() => setActiveTab("notifications")}
                >
                  <RiNotification3Line className="w-5 h-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <div className="candidate-header-card">
                  <div className="candidate-avatar w-12 h-12">
          {employeeData?.profilePictureUrl ? (
            <img src={employeeData.profilePictureUrl} alt="Employee avatar" />
                    ) : (
                        <span>{getEmployeeInitials()}</span>
                    )}
                  </div>
                  <div>
                    <p className="candidate-header-name">{employeeData?.name || 'Employee'}</p>
                    <p className="candidate-header-role">{employeeData?.position || 'Employee'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-6">
            {/* Sidebar - Matching Candidate Profile */}
            <aside className="w-64 flex-shrink-0">
              <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sticky top-24">
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                        activeTab === "dashboard" ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <RiDashboardLine className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                        activeTab === "profile" ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <RiUserLine className="w-5 h-5" />
                  Profile
                </button>
                <button
                    onClick={() => setActiveTab("candidates")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                        activeTab === "candidates" ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <RiFileList3Line className="w-5 h-5" />
                  Candidates
                </button>
                <button
                    onClick={() => setActiveTab("jobs")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                        activeTab === "jobs" ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <RiBriefcaseLine className="w-5 h-5" />
                  Jobs
                </button>
                <button
                    onClick={() => setActiveTab("recommendations")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                        activeTab === "recommendations" ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <RiThumbUpLine className="w-5 h-5" />
                  Recommendations
                  {recommendations.length > 0 && (
                      <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setActiveTab("notifications")}
                >
                  <RiNotification3Line className="w-5 h-5" />
                  Notifications
                  {unreadNotifications > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadNotifications}
                  </span>
                  )}
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <RiLogoutBoxLine className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
              {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    {/* Dashboard Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Profile Complete</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{Math.round(profileCompleteness)}%</p>
                          </div>
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <RiUserLine className="w-6 h-6 text-gray-700" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gray-800 h-3 rounded-full transition-all"
                                style={{ width: `${profileCompleteness}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            {profileCompleteness >= 100
                                ? "Profile complete! Great job!"
                                : "Complete your profile to access all features."}
                          </p>
                          {completenessError && (
                              <p className="text-xs text-red-500 mt-2">{completenessError}</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Candidates</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardMetrics.totalCandidates}</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-lg">
                            <RiFileList3Line className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Active Jobs</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardMetrics.activeJobs}</p>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <RiBriefcaseLine className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">My Recommendations</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{recommendations.length}</p>
                          </div>
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <RiThumbUpLine className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Refresh Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={fetchProfileCompleteness}
                            className="btn btn-secondary"
                            disabled={loadingCompleteness}
                        >
                          <RiRefreshLine className="w-4 h-4" />
                          {loadingCompleteness ? "Refreshing..." : "Refresh Profile Data"}
                        </button>
                        <button
                            onClick={fetchDashboardMetrics}
                            className="btn btn-secondary"
                        >
                          <RiRefreshLine className="w-4 h-4" />
                          Refresh Metrics
                        </button>
                        <button
                            onClick={fetchNotificationCount}
                            className="btn btn-secondary"
                        >
                          <RiRefreshLine className="w-4 h-4" />
                          Refresh Notifications
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
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="jobs-header">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Candidates</h2>
                        <p className="text-sm text-gray-600">Browse and manage candidate profiles</p>
                      </div>
                      <div className="apps-controls">
                        <div className="search">
                          <RiSearchLine className="w-4 h-4 text-gray-400" />
                          <input
                              type="text"
                              placeholder="Search by skill..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="apps-input"
                              style={{ border: 'none', padding: '0.5rem' }}
                          />
                        </div>
                        <select
                            className="apps-select"
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
                        <div className="loading">Loading candidates...</div>
                    ) : candidates.length === 0 ? (
                        <div className="empty">No candidates found</div>
                    ) : (
                        <div className="jobs-grid">
                          {candidates.map((candidate) => (
                              <div key={candidate.candidateId || candidate.id || candidate.userId} className="job-card">
                                <div className="job-card-header">
                                  <div className="flex items-center gap-3">
                                    <div className="candidate-avatar w-12 h-12">
                                      {getCandidateImageUrl(candidate) ? (
                                        <img src={getCandidateImageUrl(candidate)} alt={candidate.name} />
                                      ) : (
                                        <RiUserLine />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                                      <p className="text-sm text-gray-600">{candidate.title || 'Candidate'}</p>
                                    </div>
                                  </div>
                                  <span className="status-badge applied">Available</span>
                                </div>

                                <div className="job-summary">
                                  {candidate.location && (
                                      <p className="text-sm text-gray-600">{candidate.location}</p>
                                  )}
                                </div>

                                {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                                    <div className="skills-list">
                                      {candidate.skills.slice(0, 4).map((skill) => (
                                          <span key={skill} className="skill-tag">{skill}</span>
                                      ))}
                                      {candidate.skills.length > 4 && (
                                          <span className="skill-tag">+{candidate.skills.length - 4} more</span>
                                      )}
                                    </div>
                                )}

                                <div className="flex gap-2 mt-4">
                                  <button
                                      className="btn btn-secondary btn-small"
                                      onClick={() => handleViewCandidate(candidate.candidateId || candidate.id || candidate.userId)}
                                  >
                                    <RiEyeLine className="w-4 h-4" />
                                    View
                                  </button>
                                  <button
                                      className="btn btn-primary btn-small"
                                      onClick={() => handleRecommendCandidate(candidate)}
                                  >
                                    <RiThumbUpLine className="w-4 h-4" />
                                    Recommend
                                  </button>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              )}

              {activeTab === "jobs" && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="jobs-header">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Active Job Postings</h2>
                        <p className="text-sm text-gray-600">Manage and view job opportunities</p>
                      </div>
                      <button
                          className="btn btn-primary"
                          onClick={fetchJobs}
                          disabled={loading}
                      >
                        <RiRefreshLine className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading jobs...</div>
                    ) : jobs.length === 0 ? (
                        <div className="empty">No active jobs found</div>
                    ) : (
                        <div className="jobs-grid">
                          {jobs.map(job => (
                              <div key={job.id} className="job-card">
                                <div className="job-card-header">
                                  <div className="flex items-center gap-3">
                                    <div className="company-logo">
                                      {getCompanyLogoUrl(job) ? (
                                        <img src={getCompanyLogoUrl(job)} alt={job.company || job.companyName || 'Company'} />
                                      ) : (
                                        <RiBriefcaseLine className="w-5 h-5 text-gray-500" />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                      {(job.company || job.companyName) && (
                                        <p className="text-sm text-gray-600">{job.company || job.companyName}</p>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`status-badge ${job.status?.toLowerCase() === 'active' ? 'applied' : 'rejected'}`}>
                            {job.status || 'Active'}
                          </span>
                                </div>

                                <div className="job-summary">
                                  <p><strong>Department:</strong> {job.department || 'Not specified'}</p>
                                  <p><strong>Location:</strong> {job.location || 'Remote'}</p>
                                  <p><strong>Type:</strong> {job.type || 'Full-time'}</p>
                                  <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex gap-2 mt-4">
                                  <button className="btn btn-primary btn-small">
                                    <RiEyeLine className="w-4 h-4" />
                                    View Details
                                  </button>
                                  <button
                                      className="btn btn-secondary btn-small"
                                      onClick={() => openJobRecommendations(job)}
                                  >
                                    <RiThumbUpLine className="w-4 h-4" />
                                    Recommendations
                                  </button>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              )}

              {activeTab === "recommendations" && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="jobs-header">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">My Recommendations</h2>
                        <p className="text-sm text-gray-600">Track your candidate recommendations</p>
                      </div>
                      <button
                          className="btn btn-primary"
                          onClick={fetchMyRecommendations}
                          disabled={loading}
                      >
                        <RiRefreshLine className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading recommendations...</div>
                    ) : recommendations.length === 0 ? (
                        <div className="empty">No recommendations yet</div>
                    ) : (
                        <div className="apps-table-wrapper">
                          <table className="apps-table">
                            <thead>
                            <tr>
                              <th>Candidate</th>
                              <th>Job</th>
                              <th>Status</th>
                              <th>Date</th>
                              <th>Note</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recommendations.map(rec => (
                                <tr key={rec.id}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div className="candidate-avatar-sm">
                                        {getRecAvatarUrl(rec) ? (
                                          <img src={getRecAvatarUrl(rec)} alt={rec.candidateName || 'Candidate'} />
                                        ) : (
                                          <span>{(rec.candidateName || 'C').charAt(0).toUpperCase()}</span>
                                        )}
                                      </div>
                                      <span>{rec.candidateName || 'Candidate'}</span>
                                    </div>
                                  </td>
                                  <td>{rec.jobTitle || 'Unknown Job'}</td>
                                  <td>
                              <span className={`status-badge ${rec.status?.toLowerCase()}`}>
                                {rec.status}
                              </span>
                                  </td>
                                  <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                                  <td>{rec.note || 'No note provided'}</td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                    )}
                  </div>
              )}

              {activeTab === "notifications" && (
                <EmployeeNotifications />
              )}
            </main>
          </div>
        </div>

        {/* Modals */}
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

        <CandidateDetailsModal
            isOpen={candidateDetailsModalOpen}
            onClose={() => { setCandidateDetailsModalOpen(false); setCandidateDetails(null); }}
            candidate={candidateDetails}
            onDownloadCv={() => candidateDetails && handleDownloadCv(candidateDetails.candidateId || candidateDetails.id || candidateDetails.userId)}
            onRecommend={() => {
              if (!candidateDetails) return;
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

        {jobRecsModalOpen && (
            <div className="modal-overlay modal-overlay--center" role="dialog" aria-modal="true" onClick={closeJobRecommendations}>
              <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Recommendations for: {selectedJobForRecs?.title}</h3>
                  <button className="close-btn" onClick={closeJobRecommendations}>×</button>
                </div>
                <div className="modal-body">
                  {jobRecsLoading && <div className="loading">Loading...</div>}
                  {!jobRecsLoading && jobRecsError && (
                      <div className="error-banner">{jobRecsError}</div>
                  )}
                  {!jobRecsLoading && !jobRecsError && jobRecs.length === 0 && (
                      <div className="empty">No recommendations yet for this job.</div>
                  )}
                  {!jobRecsLoading && !jobRecsError && jobRecs.length > 0 && (
                      <div className="space-y-4">
                            {jobRecs.map((rec, idx) => (
                                <div key={rec.id || idx} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <div className="candidate-avatar w-12 h-12">
                                        {rec.candidateProfilePictureUrl ? (
                                          <img src={rec.candidateProfilePictureUrl} alt={rec.candidateName || rec.candidate?.name || 'Candidate'} />
                                        ) : (
                                          <span style={{ fontSize: 18 }}>{rec.candidateName ? rec.candidateName[0] : (rec.candidate?.name ? rec.candidate?.name[0] : 'C')}</span>
                                        )}
                                      </div>
                                      <h4 className="font-semibold">{rec.candidateName || rec.candidate?.name || 'Candidate'}</h4>
                                    </div>
                                    {rec.status && (
                                        <span className={`status-badge ${String(rec.status).toLowerCase()}`}>
                                {rec.status}
                              </span>
                                    )}
                                  </div>
                                  {rec.note && <p className="text-sm text-gray-600 mt-2">{rec.note}</p>}
                                  {rec.createdAt && (
                                      <p className="text-xs text-gray-500 mt-2">
                                        {new Date(rec.createdAt).toLocaleDateString()}
                                      </p>
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
