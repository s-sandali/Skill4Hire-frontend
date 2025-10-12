import { useState, useEffect, useCallback } from 'react';
import {
  RiBuildingLine,
  RiBriefcaseLine,
  RiBarChartBoxLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiDownloadLine,
  RiUploadCloudLine,
  RiImageLine,
  RiStarLine,
  RiGlobalLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiSaveLine,
  RiLockLine,
  RiNotificationLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiCloseLine,
  RiRefreshLine
} from 'react-icons/ri';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { jobService } from '../services/jobService';
import JobForm from './JobForm';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Job-related state
  const [jobPostings, setJobPostings] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsInitialized, setJobsInitialized] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobError, setJobError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState('');
  const [selectedRecommendationJob, setSelectedRecommendationJob] = useState('all');

  // Company settings state
  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'success', 'error', ''
  const [companySettings, setCompanySettings] = useState({
    // Basic Information
    companyName: "",
    email: "",
    phone: "",
    website: "",
    
    // Address
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    
    // Company Details
    industry: "",
    companySize: "",
    founded: "",
    description: "",
    
    // Social Media
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    
    // Preferences
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      applicationUpdates: true,
      weeklyReports: true
    }
  });

  const formatSalary = (value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toLocaleString() : value;
  };

  const toSkillList = useCallback((rawSkills) => {
    if (!rawSkills) return [];
    if (Array.isArray(rawSkills)) return rawSkills.filter(Boolean);
    if (typeof rawSkills === 'string') {
      return rawSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }
    return [];
  }, []);


  const normalizeRecommendations = useCallback((payload) => {
    const rawList = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.recommendations)
        ? payload.recommendations
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

    return rawList.map((item, index) => {
      const skillsArray = Array.isArray(item?.skills)
        ? item.skills
        : typeof item?.skills === 'string'
          ? item.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [];

      return {
        id: item?.id || item?._id || item?.candidateId || `rec-${index}`,
        candidateName: item?.candidateName || item?.name || 'Candidate',
        email: item?.candidateEmail || item?.email || '',
        matchScore: item?.matchScore ?? item?.score ?? null,
        jobTitle: item?.jobTitle || item?.job?.title || '',
        jobId: item?.jobId || item?.jobPostId || item?.job?.id || null,
        summary: item?.summary || item?.notes || '',
        skills: skillsArray,
        resumeUrl: item?.resumeUrl || '',
      };
    });
  }, []);

  const loadRecommendations = useCallback(async (jobId = 'all') => {
    setRecommendationsLoading(true);
    setRecommendationsError('');
    try {
      const data = jobId && jobId !== 'all'
        ? await companyService.getRecommendationsForJob(jobId)
        : await companyService.getRecommendations();
      setRecommendations(normalizeRecommendations(data));
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to load recommendations';
      setRecommendations([]);
      setRecommendationsError(message);
    } finally {
      setRecommendationsLoading(false);
    }
  }, [normalizeRecommendations]);

  // Load job postings from backend
  const loadJobPostings = useCallback(async () => {
    try {
      setJobsLoading(true);
      setJobError('');
      console.log('Loading job postings...');
      
      const jobs = await jobService.getAll();
      console.log('Loaded jobs:', jobs);
      const normalizedJobs = Array.isArray(jobs) ? jobs : [];
      setJobPostings(normalizedJobs);
    } catch (error) {
      console.error('Failed to load job postings:', error);
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setJobError('Failed to load job postings: ' + message);
      setJobPostings([]);
    } finally {
      setJobsLoading(false);
      setJobsInitialized(true);
    }
  }, []);

  // Handle job deletion with confirmation
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      setJobsLoading(true);
      await jobService.remove(jobId);
      
      // Remove from local state
      setJobPostings(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      console.log('Job deleted successfully');
    } catch (error) {
      console.error('Failed to delete job:', error);
      setJobError('Failed to delete job: ' + (error.response?.data?.message || error.message));
    } finally {
      setJobsLoading(false);
    }
  };

  // Handle job creation/editing
  const handleJobSave = async (savedJob) => {
    console.log('Job saved:', savedJob);
    
    // Refresh job list
    await loadJobPostings();
    
    // Close form
    setShowJobForm(false);
    setEditingJob(null);
  };

  // Handle job form cancel
  const handleJobFormCancel = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  // Handle creating new job
  const handleCreateNewJob = () => {
    console.log('Creating new job');
    setEditingJob(null); // Clear any existing editing job
    setShowJobForm(true);
  };

  // Handle editing existing job
  const handleEditJob = (job) => {
    console.log('Editing job:', job);
    setEditingJob(job);
    setShowJobForm(true);
  };

  // Handle viewing job details
  const handleViewJobDetails = (job) => {
    console.log('Viewing job details:', job);
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  // Handle closing job details
  const handleCloseJobDetails = () => {
    setSelectedJob(null);
    setShowJobDetails(false);
  };

  // Format job status for display
  const formatJobStatus = (job) => {
    if (job.status && job.status.toLowerCase() === 'active') {
      return 'Active';
    }
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return 'Expired';
    }
    return 'Active';
  };

  // Get job status CSS class
  const getJobStatusClass = (job) => {
    const status = formatJobStatus(job);
    return status.toLowerCase().replace(' ', '-');
  };

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

  // Load company profile data
  const loadCompanyProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading company profile...');
      
      const profileData = await companyService.getProfile();
      console.log('Raw profile data from API:', profileData);
      
      if (!profileData) {
        console.log('No profile data received');
        return;
      }
      
      const mappedSettings = {
        companyName: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        website: profileData.website || "",
        address: profileData.address || "",
        city: profileData.city || "",
        state: profileData.state || "",
        zipCode: profileData.zipCode || "",
        country: profileData.country || "",
        industry: profileData.industry || "",
        companySize: profileData.companySize || "",
        founded: profileData.founded || "",
        description: profileData.description || "",
        linkedinUrl: profileData.linkedin || "",
        twitterUrl: profileData.twitter || "",
        facebookUrl: profileData.facebook || "",
        notifications: {
          emailAlerts: true,
          smsAlerts: false,
          applicationUpdates: true,
          jobAlerts: true,
          weeklyReports: false
        }
      };
      
      setCompanySettings(mappedSettings);

      if (profileData.logo) {
        setLogoPreview(profileData.logo);
      }
      
    } catch (error) {
      console.error('Failed to load company profile:', error);
      if (error.response?.status === 403) {
        setSaveMessage('Authentication failed. Please login again.');
        setSaveStatus('error');
      } else {
        setSaveMessage('Failed to load company profile: ' + error.message);
        setSaveStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load profile data and jobs when component mounts
  useEffect(() => {
    loadCompanyProfile();
    loadJobPostings();
  }, [loadCompanyProfile, loadJobPostings]);

  // Load jobs when jobs tab is selected
  useEffect(() => {
    if (activeTab === 'jobs' && !jobsInitialized && !jobsLoading) {
      loadJobPostings();
    }
  }, [activeTab, jobsInitialized, jobsLoading, loadJobPostings]);

  useEffect(() => {
    if (activeTab !== 'recommendations') return;
    loadRecommendations(selectedRecommendationJob);
  }, [activeTab, loadRecommendations, selectedRecommendationJob]);

  // Logo upload handler
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setSaveStatus('error');
        setSaveMessage('Please upload a valid image file (PNG, JPG, SVG)');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setSaveStatus('error');
        setSaveMessage('File size must be less than 5MB');
        return;
      }

      setIsSaving(true);
      setSaveMessage('Uploading logo...');
      setSaveStatus('');

      const response = await companyService.uploadLogo(file);
      
      setCompanyLogo(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Prefer server-provided URL/path if returned
      if (response && (response.logo || response.logoUrl)) {
        setLogoPreview(response.logo || response.logoUrl);
      }

      setSaveStatus('success');
      setSaveMessage('Logo uploaded successfully!');
      
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
        setIsSaving(false);
      }, 3000);

    } catch (error) {
      console.error('Logo upload failed:', error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to upload logo');
      setIsSaving(false);
      
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    setLogoPreview(null);
    setSaveStatus('success');
    setSaveMessage('Logo removed');
    
    setTimeout(() => {
      setSaveMessage('');
      setSaveStatus('');
    }, 2000);
  };

  const handleSettingsChange = (section, field, value) => {
    setCompanySettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    if (saveMessage) {
      setSaveMessage('');
      setSaveStatus('');
    }
  };

  const handleBasicSettingsChange = (field, value) => {
    setCompanySettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (saveMessage) {
      setSaveMessage('');
      setSaveStatus('');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveStatus('');
    
    try {
      const settingsPayload = {
        name: companySettings.companyName,
        industry: companySettings.industry,
        companySize: companySettings.companySize,
        founded: companySettings.founded,
        description: companySettings.description,
        email: companySettings.email,
        phone: companySettings.phone,
        website: companySettings.website,
        address: companySettings.address,
        city: companySettings.city,
        state: companySettings.state,
        zipCode: companySettings.zipCode,
        country: companySettings.country,
        facebook: companySettings.facebookUrl || '',
        linkedin: companySettings.linkedinUrl || '',
        twitter: companySettings.twitterUrl || '',
        notifications: companySettings.notifications
      };

      await companyService.updateProfile(settingsPayload);
      
      if (companyLogo) {
        await companyService.updateLogo(companyLogo);
      }
      
      setSaveStatus('success');
      setSaveMessage('All settings saved successfully!');
      
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to save settings. Please try again.');
      
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 8000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      const currentPassword = prompt('Enter your current password:');
      const newPassword = prompt('Enter new password:');
      const confirmPassword = prompt('Confirm new password:');
      
      if (currentPassword && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        await companyService.changePassword({
          currentPassword,
          newPassword,
          confirmPassword
        });
        
        setSaveStatus('success');
        setSaveMessage('Password changed successfully!');
        
        setTimeout(() => {
          setSaveMessage('');
          setSaveStatus('');
        }, 5000);
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to change password');
      
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
    }
  };

  const handleEmailUpdate = async () => {
    try {
      const newEmail = prompt('Enter new email address:');
      const password = prompt('Enter your password to confirm:');
      
      if (newEmail && password) {
        await companyService.updateEmail({
          newEmail,
          password
        });
        
        setSaveStatus('success');
        setSaveMessage('Email updated successfully! Please verify your new email.');
        
        setTimeout(() => {
          setSaveMessage('');
          setSaveStatus('');
        }, 5000);
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to update email');
      
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
      
      if (confirmation) {
        const password = prompt('Enter your password to confirm account deletion:');
        const confirmationText = prompt('Type "DELETE" to confirm:');
        
        if (password && confirmationText === 'DELETE') {
          await companyService.deleteAccount({
            password,
            confirmation: confirmationText
          });
          
          localStorage.clear();
          window.location.href = '/login';
        } else if (confirmationText !== 'DELETE') {
          throw new Error('Please type "DELETE" to confirm');
        }
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to delete account');
      
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
    }
  };

  return (
    <div className="company-dashboard">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <RiLoader4Line className="spin" />
          </div>
          <p>Loading company profile...</p>
        </div>
      ) : (
        <>
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
                    <span className="user-name">{companySettings.companyName || 'Your Company'}</span>
                    <span className="user-role">{companySettings.industry || 'Industry not set'}</span>
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
              className={`nav-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <RiStarLine /> Recommendations
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
                <h2>Welcome back, {companySettings.companyName || 'Your Company'}!</h2>
                
                <div className="company-overview-card">
                  <h3>Company Profile</h3>
                  <div className="company-details">
                    <div className="detail-row">
                      <strong>Company Name:</strong> {companySettings.companyName || 'Not set'}
                    </div>
                    <div className="detail-row">
                      <strong>Industry:</strong> {companySettings.industry || 'Not specified'}
                    </div>
                    <div className="detail-row">
                      <strong>Company Size:</strong> {companySettings.companySize || 'Not specified'}
                    </div>
                    <div className="detail-row">
                      <strong>Founded:</strong> {companySettings.founded || 'Not specified'}
                    </div>
                    <div className="detail-row">
                      <strong>Website:</strong> {companySettings.website ? (
                        <a href={companySettings.website} target="_blank" rel="noopener noreferrer">
                          {companySettings.website}
                        </a>
                      ) : 'Not set'}
                    </div>
                    <div className="detail-row">
                      <strong>Location:</strong> {
                        [companySettings.city, companySettings.state, companySettings.country]
                          .filter(Boolean).join(', ') || 'Not specified'
                      }
                    </div>
                    {companySettings.description && (
                      <div className="detail-row description">
                        <strong>Description:</strong>
                        <p>{companySettings.description}</p>
                      </div>
                    )}
                  </div>
                </div>

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
                      <RiStarLine />
                    </div>
                    <div className="stat-content">
                      <h3>{recommendations.length}</h3>
                      <p>Saved Recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="jobs-tab">
                {showJobForm ? (
                  <JobForm
                    jobId={editingJob?.id}
                    initialJob={editingJob}
                    onSave={handleJobSave}
                    onCancel={handleJobFormCancel}
                  />
                ) : (
                  <>
                    <div className="tab-header">
                      <h2>Job Postings</h2>
                      <div className="header-actions">
                        <button 
                          className="btn-secondary"
                          onClick={loadJobPostings}
                          disabled={jobsLoading}
                          title="Refresh job postings"
                        >
                          <RiRefreshLine />
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={handleCreateNewJob}
                          disabled={jobsLoading}
                        >
                          <RiAddLine /> Post New Job
                        </button>
                      </div>
                    </div>

                    {jobError && (
                      <div className="error-message">
                        <RiErrorWarningLine />
                        {jobError}
                        <button 
                          className="retry-btn"
                          onClick={loadJobPostings}
                          disabled={jobsLoading}
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {jobsLoading ? (
                      <div className="loading-container">
                        <div className="loading-spinner">
                          <RiLoader4Line className="spin" />
                        </div>
                        <p>Loading job postings...</p>
                      </div>
                    ) : jobPostings.length === 0 ? (
                      <div className="empty-state">
                        <RiBriefcaseLine />
                        <h3>No job postings yet</h3>
                        <p>Create your first job posting to start attracting candidates.</p>
                        <button 
                          className="btn-primary"
                          onClick={handleCreateNewJob}
                        >
                          <RiAddLine /> Post Your First Job
                        </button>
                      </div>
                    ) : (
                      <div className="jobs-grid">
                        {jobPostings.map(job => (
                          <div key={job.id} className="job-card">
                            <div className="job-header">
                              <h3>{job.title}</h3>
                              <span className={`status-badge ${getJobStatusClass(job)}`}>
                                {formatJobStatus(job)}
                              </span>
                            </div>
                            <div className="job-details">
                              <p><strong>Type:</strong> {job.type}</p>
                              <p><strong>Location:</strong> {job.location}</p>
                              {formatSalary(job.salary) && (
                                <p><strong>Salary:</strong> ${formatSalary(job.salary)}</p>
                              )}
                              {job.experience && <p><strong>Experience:</strong> {job.experience} years</p>}
                              {job.deadline && (
                                <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                              )}
                              <p className="job-description">{job.description}</p>
                              {toSkillList(job.skills).length > 0 && (
                                <div className="skills-list" aria-label="Required skills">
                                  {toSkillList(job.skills).map((skill) => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="job-actions">
                              <button 
                                className="btn-primary"
                                onClick={() => handleViewJobDetails(job)}
                              >
                                <RiEyeLine /> View Details
                              </button>
                              <button 
                                className="btn-secondary"
                                onClick={() => handleEditJob(job)}
                              >
                                <RiEditLine /> Edit
                              </button>
                              <button 
                                className="btn-danger"
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={jobsLoading}
                              >
                                <RiDeleteBinLine /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Job Details Modal */}
                    {showJobDetails && selectedJob && (
                      <div className="modal-overlay" onClick={handleCloseJobDetails}>
                        <div className="job-details-modal" onClick={(e) => e.stopPropagation()}>
                          <div className="modal-header">
                            <h2>{selectedJob.title}</h2>
                            <button className="close-btn" onClick={handleCloseJobDetails}>
                              <RiCloseLine />
                            </button>
                          </div>
                          <div className="modal-content">
                            <div className="job-info-grid">
                              <div className="info-item">
                                <strong>Job Type:</strong>
                                <span>{selectedJob.type}</span>
                              </div>
                              <div className="info-item">
                                <strong>Location:</strong>
                                <span>{selectedJob.location}</span>
                              </div>
                              <div className="info-item">
                                <strong>Status:</strong>
                                <span className={`status-badge ${getJobStatusClass(selectedJob)}`}>
                                  {formatJobStatus(selectedJob)}
                                </span>
                              </div>
                              {formatSalary(selectedJob.salary) && (
                                <div className="info-item">
                                  <strong>Salary:</strong>
                                  <span>${formatSalary(selectedJob.salary)}</span>
                                </div>
                              )}
                              {selectedJob.experience && (
                                <div className="info-item">
                                  <strong>Experience Required:</strong>
                                  <span>{selectedJob.experience} years</span>
                                </div>
                              )}
                              {selectedJob.deadline && (
                                <div className="info-item">
                                  <strong>Application Deadline:</strong>
                                  <span>{new Date(selectedJob.deadline).toLocaleDateString()}</span>
                                </div>
                              )}
                              {selectedJob.createdAt && (
                                <div className="info-item">
                                  <strong>Posted Date:</strong>
                                  <span>{new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                                </div>
                              )}
                              {selectedJob.updatedAt && (
                                <div className="info-item">
                                  <strong>Last Updated:</strong>
                                  <span>{new Date(selectedJob.updatedAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            {toSkillList(selectedJob.skills).length > 0 && (
                              <div className="skills-section">
                                <h3>Key Skills</h3>
                                <div className="skills-list">
                                  {toSkillList(selectedJob.skills).map((skill) => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="description-section">
                              <h3>Job Description</h3>
                              <div className="job-description-full">
                                {selectedJob.description.split('\n').map((paragraph, index) => (
                                  <p key={index}>{paragraph}</p>
                                ))}
                              </div>
                            </div>
                            {selectedJob.company && (
                              <div className="company-section">
                                <h3>Company Information</h3>
                                <div className="company-info">
                                  <p><strong>Company:</strong> {selectedJob.company.name || companySettings.companyName}</p>
                                  {selectedJob.company.industry && (
                                    <p><strong>Industry:</strong> {selectedJob.company.industry}</p>
                                  )}
                                  {selectedJob.company.website && (
                                    <p><strong>Website:</strong> 
                                      <a href={selectedJob.company.website} target="_blank" rel="noopener noreferrer">
                                        {selectedJob.company.website}
                                      </a>
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="modal-actions">
                            <button 
                              className="btn-primary"
                              onClick={() => {
                                handleCloseJobDetails();
                                handleEditJob(selectedJob);
                              }}
                            >
                              <RiEditLine /> Edit Job
                            </button>
                            <button 
                              className="btn-danger"
                              onClick={() => {
                                handleCloseJobDetails();
                                handleDeleteJob(selectedJob.id);
                              }}
                            >
                              <RiDeleteBinLine /> Delete Job
                            </button>
                            <button className="btn-secondary" onClick={handleCloseJobDetails}>
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {activeTab === 'recommendations' && (
              <div className="recommendations-tab">
                <div className="recommendations-header">
                  <h2>Candidate Recommendations</h2>
                  <div className="recommendations-controls">
                    <label htmlFor="recommendations-job-filter">Filter by job</label>
                    <select
                      id="recommendations-job-filter"
                      value={selectedRecommendationJob}
                      onChange={(event) => setSelectedRecommendationJob(event.target.value)}
                    >
                      <option value="all">All active jobs</option>
                      {jobPostings.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title || job.jobTitle || 'Untitled position'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => loadRecommendations(selectedRecommendationJob)}
                    >
                      <RiRefreshLine /> Refresh
                    </button>
                  </div>
                </div>

                {recommendationsLoading && (
                  <div className="recommendations-loading">
                    <RiLoader4Line className="spin" />
                    <p>Fetching recommended candidates...</p>
                  </div>
                )}

                {!recommendationsLoading && recommendationsError && (
                  <div className="recommendations-error">
                    <RiErrorWarningLine />
                    <span>{recommendationsError}</span>
                  </div>
                )}

                {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
                  <div className="recommendations-empty">
                    <p>No recommendations available yet. Post a job or adjust your filters to see matches.</p>
                  </div>
                )}

                {!recommendationsLoading && !recommendationsError && recommendations.length > 0 && (
                  <div className="recommendations-list">
                    {recommendations.map((rec) => {
                      const score = typeof rec.matchScore === 'number'
                        ? Math.round(rec.matchScore > 0 && rec.matchScore <= 1 ? rec.matchScore * 100 : rec.matchScore)
                        : null;

                      return (
                        <div key={rec.id} className="recommendation-card">
                          <div className="recommendation-card-header">
                            <div>
                              <h3>{rec.candidateName}</h3>
                              <p className="recommendation-job">{rec.jobTitle || 'General fit'}</p>
                            </div>
                            {score !== null && <span className="recommendation-score">{score}% Match</span>}
                          </div>

                          {rec.skills.length > 0 && (
                            <div className="recommendation-skills">
                              {rec.skills.slice(0, 8).map((skill) => (
                                <span key={`${rec.id}-${skill}`} className="skill-tag">{skill}</span>
                              ))}
                            </div>
                          )}

                          {rec.summary && <p className="recommendation-summary">{rec.summary}</p>}

                          <div className="recommendation-actions">
                            {rec.resumeUrl && (
                              <a
                                href={rec.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-outline small"
                              >
                                <RiDownloadLine /> Resume
                              </a>
                            )}
                            {rec.email && (
                              <a href={`mailto:${rec.email}`} className="btn-primary small">
                                <RiMailLine /> Contact
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="settings-tab">
                <div className="tab-header">
                  <h2>Company Settings</h2>
                  <div className="save-section">
                    {saveMessage && (
                      <div className={`save-message ${saveStatus}`}>
                        {saveStatus === 'success' && <RiCheckLine />}
                        {saveStatus === 'error' && <RiErrorWarningLine />}
                        {saveMessage}
                      </div>
                    )}
                    <button 
                      className={`btn-primary ${isSaving ? 'loading' : ''}`} 
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <RiLoader4Line className="spinning" /> Saving...
                        </>
                      ) : (
                        <>
                          <RiSaveLine /> Save All Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="settings-sections">
                  {/* Company Logo Section */}
                  <div className="settings-section">
                    <h3><RiImageLine /> Company Logo</h3>
                    <div className="logo-upload-section">
                      <div className="current-logo">
                        {logoPreview ? (
                          <div className="logo-preview-container">
                            <img src={logoPreview} alt="Company Logo Preview" className="logo-preview" />
                            <button 
                              type="button" 
                              className="remove-logo-btn"
                              onClick={handleRemoveLogo}
                              title="Remove logo"
                            >
                              <RiCloseLine />
                            </button>
                          </div>
                        ) : (
                          <div className="logo-placeholder">
                            <RiImageLine />
                            <span>No logo uploaded</span>
                          </div>
                        )}
                      </div>
                      <div className="logo-upload-controls">
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                          disabled={isSaving}
                        />
                        <label 
                          htmlFor="logo-upload" 
                          className={`btn-secondary ${isSaving ? 'disabled' : ''}`}
                        >
                          {isSaving ? (
                            <>
                              <RiLoader4Line className="spinning" /> Uploading...
                            </>
                          ) : (
                            <>
                              <RiUploadCloudLine /> {logoPreview ? 'Change Logo' : 'Upload Logo'}
                            </>
                          )}
                        </label>
                        <p className="upload-hint">
                          Recommended: 200x200px, max 5MB (PNG, JPG, SVG)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Company Information */}
                  <div className="settings-section">
                    <h3><RiBuildingLine /> Basic Information</h3>
                    <div className="settings-grid">
                      <div className="setting-item">
                        <label>Company Name *</label>
                        <input 
                          type="text" 
                          value={companySettings.companyName}
                          onChange={(e) => handleBasicSettingsChange('companyName', e.target.value)}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Industry *</label>
                        <select 
                          value={companySettings.industry}
                          onChange={(e) => handleBasicSettingsChange('industry', e.target.value)}
                        >
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail">Retail</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Company Size</label>
                        <select 
                          value={companySettings.companySize}
                          onChange={(e) => handleBasicSettingsChange('companySize', e.target.value)}
                        >
                          <option value="">Select Size</option>
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="51-100 employees">51-100 employees</option>
                          <option value="100-500 employees">100-500 employees</option>
                          <option value="500+ employees">500+ employees</option>
                        </select>
                      </div>
                      <div className="setting-item">
                        <label>Founded Year</label>
                        <input 
                          type="number" 
                          value={companySettings.founded}
                          onChange={(e) => handleBasicSettingsChange('founded', e.target.value)}
                          placeholder="e.g., 2018"
                          min="1800"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>
                    <div className="setting-item full-width">
                      <label>Company Description</label>
                      <textarea 
                        value={companySettings.description}
                        onChange={(e) => handleBasicSettingsChange('description', e.target.value)}
                        placeholder="Describe your company, mission, and values..."
                        rows="4"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="settings-section">
                    <h3><RiMailLine /> Contact Information</h3>
                    <div className="settings-grid">
                      <div className="setting-item">
                        <label>Email Address *</label>
                        <div className="input-with-icon">
                          <RiMailLine />
                          <input 
                            type="email" 
                            value={companySettings.email}
                            onChange={(e) => handleBasicSettingsChange('email', e.target.value)}
                            placeholder="company@example.com"
                          />
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>Phone Number</label>
                        <div className="input-with-icon">
                          <RiPhoneLine />
                          <input 
                            type="tel" 
                            value={companySettings.phone}
                            onChange={(e) => handleBasicSettingsChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                      <div className="setting-item">
                        <label>Website</label>
                        <div className="input-with-icon">
                          <RiGlobalLine />
                          <input 
                            type="url" 
                            value={companySettings.website}
                            onChange={(e) => handleBasicSettingsChange('website', e.target.value)}
                            placeholder="https://yourcompany.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="settings-section">
                    <h3><RiMapPinLine /> Address</h3>
                    <div className="settings-grid">
                      <div className="setting-item full-width">
                        <label>Street Address</label>
                        <input 
                          type="text" 
                          value={companySettings.address}
                          onChange={(e) => handleBasicSettingsChange('address', e.target.value)}
                          placeholder="123 Business Street"
                        />
                      </div>
                      <div className="setting-item">
                        <label>City</label>
                        <input 
                          type="text" 
                          value={companySettings.city}
                          onChange={(e) => handleBasicSettingsChange('city', e.target.value)}
                          placeholder="San Francisco"
                        />
                      </div>
                      <div className="setting-item">
                        <label>State/Province</label>
                        <input 
                          type="text" 
                          value={companySettings.state}
                          onChange={(e) => handleBasicSettingsChange('state', e.target.value)}
                          placeholder="CA"
                        />
                      </div>
                      <div className="setting-item">
                        <label>ZIP/Postal Code</label>
                        <input 
                          type="text" 
                          value={companySettings.zipCode}
                          onChange={(e) => handleBasicSettingsChange('zipCode', e.target.value)}
                          placeholder="94102"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Country</label>
                        <select 
                          value={companySettings.country}
                          onChange={(e) => handleBasicSettingsChange('country', e.target.value)}
                        >
                          <option value="">Select Country</option>
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="settings-section">
                    <h3><RiGlobalLine /> Social Media</h3>
                    <div className="settings-grid">
                      <div className="setting-item">
                        <label>LinkedIn URL</label>
                        <input 
                          type="url" 
                          value={companySettings.linkedinUrl}
                          onChange={(e) => handleBasicSettingsChange('linkedinUrl', e.target.value)}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Twitter URL</label>
                        <input 
                          type="url" 
                          value={companySettings.twitterUrl}
                          onChange={(e) => handleBasicSettingsChange('twitterUrl', e.target.value)}
                          placeholder="https://twitter.com/yourcompany"
                        />
                      </div>
                      <div className="setting-item">
                        <label>Facebook URL</label>
                        <input 
                          type="url" 
                          value={companySettings.facebookUrl}
                          onChange={(e) => handleBasicSettingsChange('facebookUrl', e.target.value)}
                          placeholder="https://facebook.com/yourcompany"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="settings-section">
                    <h3><RiNotificationLine /> Notification Preferences</h3>
                    <div className="notification-settings">
                      <div className="notification-item">
                        <div className="notification-info">
                          <h4>Email Alerts</h4>
                          <p>Receive important updates via email</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={companySettings.notifications.emailAlerts}
                            onChange={(e) => handleSettingsChange('notifications', 'emailAlerts', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <h4>SMS Alerts</h4>
                          <p>Get urgent notifications via SMS</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={companySettings.notifications.smsAlerts}
                            onChange={(e) => handleSettingsChange('notifications', 'smsAlerts', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <h4>Application Updates</h4>
                          <p>Notifications when candidates apply to your jobs</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={companySettings.notifications.applicationUpdates}
                            onChange={(e) => handleSettingsChange('notifications', 'applicationUpdates', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <h4>Weekly Reports</h4>
                          <p>Receive weekly analytics and performance reports</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={companySettings.notifications.weeklyReports}
                            onChange={(e) => handleSettingsChange('notifications', 'weeklyReports', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Account Security */}
                  <div className="settings-section">
                    <h3><RiLockLine /> Account Security</h3>
                    <div className="security-actions">
                      <button 
                        className="btn-secondary"
                        onClick={handlePasswordChange}
                      >
                        <RiLockLine /> Change Password
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={handleEmailUpdate}
                      >
                        <RiMailLine /> Update Email
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={handleAccountDeletion}
                      >
                        <RiDeleteBinLine /> Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default CompanyDashboard;

