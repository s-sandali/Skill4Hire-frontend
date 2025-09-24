import { useState, useEffect } from 'react';
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
  RiNotification3Line,
  RiUploadCloudLine,
  RiImageLine,
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
  RiCloseLine
} from 'react-icons/ri';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

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

  // Load company profile data
  const loadCompanyProfile = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading company profile...');
      
      // Debug: Check authentication status
      console.log('🔍 Current userRole from localStorage:', localStorage.getItem('userRole'));
      console.log('🔍 Current userId from localStorage:', localStorage.getItem('userId'));
      console.log('🔍 Current cookies:', document.cookie);
      
      const profileData = await companyService.getProfile();
      console.log('📦 Raw profile data from API:', profileData);
      
      // Check if we got data
      if (!profileData) {
        console.log('❌ No profile data received');
        return;
      }
      
      // Map the database fields to your frontend state
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
      
      console.log('🎯 Mapped settings:', mappedSettings);
      setCompanySettings(mappedSettings);

      // Set logo if available
      if (profileData.logo) {
        setLogoPreview(profileData.logo);
        console.log('🖼️ Logo set:', profileData.logo);
      }
      
      console.log('✅ Profile loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load company profile:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error headers:', error.response?.headers);
      console.error('Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        console.error('🚫 Authentication issue - you may need to login again');
        setSaveMessage('Authentication failed. Please login again.');
        setSaveStatus('error');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        setSaveMessage('Failed to load company profile: ' + error.message);
        setSaveStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile data when component mounts
  useEffect(() => {
    loadCompanyProfile();
  }, []);

  // Logo upload handler
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setSaveStatus('error');
        setSaveMessage('Please upload a valid image file (PNG, JPG, SVG)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setSaveStatus('error');
        setSaveMessage('File size must be less than 5MB');
        return;
      }

      // Show uploading status
      setIsSaving(true);
      setSaveMessage('Uploading logo...');
      setSaveStatus('');

      console.log('📤 Uploading logo:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Upload to backend
      const response = await companyService.uploadLogo(file);
      console.log('✅ Logo upload response:', response);
      
      // Store the file for local state
      setCompanyLogo(file);
      
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        console.log('🖼️ Logo preview set');
      };
      reader.readAsDataURL(file);

      // If backend returns a logo URL, use that instead
      if (response && response.logoUrl) {
        setLogoPreview(response.logoUrl);
        console.log('🔗 Using backend logo URL:', response.logoUrl);
      }

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Logo uploaded successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
        setIsSaving(false);
      }, 3000);

    } catch (error) {
      console.error('❌ Logo upload failed:', error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to upload logo');
      setIsSaving(false);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
    }
  };

  // Remove logo handler
  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    setLogoPreview(null);
    setSaveStatus('success');
    setSaveMessage('Logo removed');
    
    // Clear message after 2 seconds
    setTimeout(() => {
      setSaveMessage('');
      setSaveStatus('');
    }, 2000);
  };

  // Settings update handler
  const handleSettingsChange = (section, field, value) => {
    setCompanySettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear any previous save messages when user makes changes
    if (saveMessage) {
      setSaveMessage('');
      setSaveStatus('');
    }
  };

  // Basic settings update handler
  const handleBasicSettingsChange = (field, value) => {
    setCompanySettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any previous save messages when user makes changes
    if (saveMessage) {
      setSaveMessage('');
      setSaveStatus('');
    }
  };

  // Save settings handler
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveStatus('');
    
    try {
      // Prepare data for API - FLATTEN the structure to match backend expectations
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

      // Save complete settings using the company service
      await companyService.updateProfile(settingsPayload);
      
      // Upload logo if a new one was selected
      if (companyLogo) {
        await companyService.updateLogo(companyLogo);
      }
      
      // Show success message
      setSaveStatus('success');
      setSaveMessage('All settings saved successfully!');
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to save settings. Please try again.');
      
      // Clear error message after 8 seconds
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 8000);
    } finally {
      setIsSaving(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    try {
      // This would typically open a modal or navigate to a password change form
      // For now, we'll show a simple prompt (in production, use a proper modal)
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

  // Email update handler
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

  // Account deletion handler
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
          
          // Redirect to login after successful deletion
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
                <span className="user-name">{companySettings.companyName || companyData.name}</span>
                <span className="user-role">{companySettings.industry || companyData.industry}</span>
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
            <h2>Welcome back, {companySettings.companyName || companyData.name}!</h2>
            
            {/* Company Information Overview */}
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
