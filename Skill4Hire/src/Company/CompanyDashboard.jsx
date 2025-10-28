import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FiBriefcase,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
  FiUploadCloud,
  FiImage,
  FiStar,
  FiGlobe,
  FiPhone,
  FiMail,
  FiSave,
  FiLock,
  FiBell,
  FiInbox,
  FiClock,
  FiCheck,
  FiAlertTriangle,
  FiLoader,
  FiX,
  FiRefreshCw,
  FiUsers,
  FiShield,
  FiInfo
} from 'react-icons/fi';
import { authService } from '../services/authService';
import { companyService } from '../services/companyService';
import { jobService } from '../services/jobService';
import JobForm from './JobForm';
import PortalLogoBadge from '../components/PortalLogoBadge.jsx';
import './CompanyDashboard.css';

const defaultNotificationPreferences = {
  emailAlerts: true,
  smsAlerts: false,
  applicationUpdates: true,
  weeklyReports: true,
  jobAlerts: true
};

const TAB_LABELS = {
  overview: 'Overview',
  jobs: 'Job Postings',
  applicants: 'Applicants',
  recommendations: 'Recommendations',
  settings: 'Settings'
};

const buildDefaultCompanySettings = () => ({
  companyName: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  industry: '',
  companySize: '',
  founded: '',
  description: '',
  linkedinUrl: '',
  twitterUrl: '',
  facebookUrl: '',
  notifications: { ...defaultNotificationPreferences },
  logo: ''
});

const loadCachedCompanySettings = () => {
  if (typeof window === 'undefined') {
    return buildDefaultCompanySettings();
  }

  try {
    const cached = window.localStorage.getItem('companyProfileCache');
    if (!cached) {
      return buildDefaultCompanySettings();
    }

    const parsed = JSON.parse(cached);
    return {
      ...buildDefaultCompanySettings(),
      ...parsed,
      notifications: {
        ...defaultNotificationPreferences,
        ...(parsed.notifications || {})
      }
    };
  } catch (error) {
    console.warn('Unable to load cached company profile', error);
    return buildDefaultCompanySettings();
  }
};

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const initialCompanySettings = useMemo(() => loadCachedCompanySettings(), []);
  const hasLoadedProfileRef = useRef(Boolean(
      initialCompanySettings.companyName ||
      initialCompanySettings.email ||
      initialCompanySettings.logo
  ));

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
  const [companySettings, setCompanySettings] = useState(initialCompanySettings);
  const [logoPreview, setLogoPreview] = useState(() => initialCompanySettings.logo || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'success', 'error', ''

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasPersistableData = Boolean(
        companySettings.companyName ||
        companySettings.email ||
        companySettings.phone ||
        companySettings.website ||
        companySettings.address ||
        companySettings.description ||
        companySettings.logo
    );

    if (!hasPersistableData && !hasLoadedProfileRef.current) return;

    if (hasPersistableData && !hasLoadedProfileRef.current) {
      hasLoadedProfileRef.current = true;
    }

    try {
      window.localStorage.setItem('companyProfileCache', JSON.stringify(companySettings));
    } catch (error) {
      console.warn('Unable to cache company profile', error);
    }
  }, [companySettings]);

  // Applicants state
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState('');
  const [selectedApplicantsJob, setSelectedApplicantsJob] = useState('all');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState('all');

  const formatSalary = (value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toLocaleString() : value;
  };

  const formatNotificationTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  const normalizeLogo = useCallback((rawLogo) => {
    if (!rawLogo) return null;
    const serialized = String(rawLogo).trim();
    return serialized.startsWith('data:')
        ? serialized
        : `data:image/png;base64,${serialized}`;
  }, []);

  const resizeImageToSquare = useCallback((file, size = 900) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Unable to process image'));
          return;
        }

        const shortestEdge = Math.min(image.width, image.height);
        const offsetX = (image.width - shortestEdge) / 2;
        const offsetY = (image.height - shortestEdge) / 2;

        context.drawImage(
            image,
            offsetX,
            offsetY,
            shortestEdge,
            shortestEdge,
            0,
            0,
            size,
            size
        );

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error('Unable to finalize image'));
            return;
          }

          const processedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.png'), {
            type: 'image/png'
          });
          const preview = canvas.toDataURL('image/png');
          resolve({ file: processedFile, preview });
        }, 'image/png');
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to read image'));
      };

      image.src = objectUrl;
    });
  }, []);

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

  const getJobTitle = useCallback((jobId) => {
    if (!jobId) return '';
    const match = jobPostings.find((job) => job.id === jobId || job.jobPostId === jobId);
    return match?.title || match?.jobTitle || '';
  }, [jobPostings]);

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

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const data = await companyService.getNotifications();
      const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
              ? data.data
              : [];
      setNotifications(list);
    } catch (err) {
      setNotifications([]);
      setNotificationsError(err?.message || 'Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const handleRefreshNotifications = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await companyService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
      setNotificationsError('');
    } catch (err) {
      setNotificationsError(err?.message || 'Failed to mark notifications as read');
    }
  }, []);

  const handleMarkNotificationRead = useCallback(async (notificationId) => {
    try {
      await companyService.markNotificationRead(notificationId);
      setNotifications((prev) => prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
      ));
      setNotificationsError('');
    } catch (err) {
      setNotificationsError(err?.message || 'Failed to update notification');
    }
  }, []);

  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await companyService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
    } catch (err) {
      setNotificationsError(err?.message || 'Failed to remove notification');
    }
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

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications();
    }
  }, [activeTab, loadNotifications]);

  useEffect(() => {
    const unread = notifications.filter((notification) => !notification?.read).length;
    setUnreadNotifications(unread);
  }, [notifications]);

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

      const normalizedLogo = profileData.logo ? normalizeLogo(profileData.logo) : '';

      setCompanySettings((prev) => {
        const nextSettings = {
          ...prev,
          companyName: profileData.name ?? profileData.companyName ?? prev.companyName ?? "",
          email: profileData.email ?? profileData.contactEmail ?? prev.email ?? "",
          phone: profileData.phone ?? profileData.phoneNumber ?? prev.phone ?? "",
          website: profileData.website ?? profileData.site ?? prev.website ?? "",
          address: profileData.address ?? prev.address ?? "",
          city: profileData.city ?? prev.city ?? "",
          state: profileData.state ?? prev.state ?? "",
          zipCode: profileData.zipCode ?? profileData.postalCode ?? prev.zipCode ?? "",
          country: profileData.country ?? prev.country ?? "",
          industry: profileData.industry ?? profileData.companyIndustry ?? prev.industry ?? "",
          companySize: profileData.companySize ?? profileData.size ?? prev.companySize ?? "",
          founded: profileData.founded ?? profileData.foundedYear ?? prev.founded ?? "",
          description: profileData.description ?? prev.description ?? "",
          linkedinUrl: profileData.linkedin ?? profileData.linkedinUrl ?? prev.linkedinUrl ?? "",
          twitterUrl: profileData.twitter ?? profileData.twitterUrl ?? prev.twitterUrl ?? "",
          facebookUrl: profileData.facebook ?? profileData.facebookUrl ?? prev.facebookUrl ?? "",
          notifications: prev.notifications,
          logo: normalizedLogo || prev.logo || ''
        };

        return nextSettings;
      });

      hasLoadedProfileRef.current = true;

      if (normalizedLogo) {
        setLogoPreview(normalizedLogo);
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
  }, [normalizeLogo]);

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
    const inputElement = event.target;
    const file = inputElement.files[0];
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

      const { file: processedFile, preview } = await resizeImageToSquare(file, 900);
      setLogoPreview(preview);
      setCompanySettings((prev) => ({ ...prev, logo: preview }));

      const response = await companyService.uploadLogo(processedFile);
      const serverLogo = response && (response.logo || response.logoUrl)
          ? normalizeLogo(response.logo || response.logoUrl)
          : null;

      if (serverLogo) {
        setLogoPreview(serverLogo);
        setCompanySettings((prev) => ({ ...prev, logo: serverLogo }));
      }

      setSaveStatus('success');
      setSaveMessage('Logo uploaded successfully!');
      inputElement.value = '';

      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 3000);

    } catch (error) {
      console.error('Logo upload failed:', error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to upload logo');
      inputElement.value = '';

      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('');
      setSaveMessage('Removing logo...');

      await companyService.removeLogo();
      setLogoPreview(null);
      setCompanySettings((prev) => ({ ...prev, logo: '' }));
      setSaveStatus('success');
      setSaveMessage('Logo removed successfully!');

      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 3000);
    } catch (error) {
      console.error('Logo removal failed:', error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Failed to remove logo');

      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus('');
      }, 5000);
    } finally {
      setIsSaving(false);
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

  const normalizeApplications = useCallback((payload) => {
    const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
    return list.map((a, i) => ({
      id: a.id || a._id || `app-${i}`,
      candidateId: a.candidateId || a.candidate || '—',
      jobId: a.jobPostId || a.jobId || null,
      jobTitle: a.jobTitle || '—',
      location: a.jobLocation || '—',
      status: a.status || 'APPLIED',
      appliedAt: a.appliedAt || a.createdAt || a.dateApplied || null,
      companyName: a.companyName || '—',
    }));
  }, []);

  const loadApplicants = useCallback(async () => {
    setApplicantsLoading(true);
    setApplicantsError('');
    try {
      const statusParam = applicantStatusFilter !== 'all' ? applicantStatusFilter : undefined;
      let res;
      if (selectedApplicantsJob && selectedApplicantsJob !== 'all') {
        res = await companyService.getJobApplications(selectedApplicantsJob, statusParam);
      } else {
        res = await companyService.getApplications(statusParam);
      }
      setApplicants(normalizeApplications(res));
    } catch (error) {
      setApplicants([]);
      setApplicantsError(error?.message || 'Failed to load applicants');
    } finally {
      setApplicantsLoading(false);
    }
  }, [selectedApplicantsJob, applicantStatusFilter, normalizeApplications]);

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      let reason;
      if (status === 'REJECTED') {
        reason = window.prompt('Please provide a reason for rejection:');
        if (!reason || !reason.trim()) {
          alert('Rejection reason is required.');
          return;
        }
      }
      await companyService.updateApplicationStatus(applicationId, status, reason);
      // Update local state
      setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status, lastUpdate: new Date().toISOString() } : a)));
    } catch (err) {
      alert(err?.message || 'Failed to update application status');
    }
  };

  // Auto-load applicants when Applicants tab is active
  useEffect(() => {
    if (activeTab === 'applicants') {
      loadApplicants();
    }
  }, [activeTab, loadApplicants]);

  const Avatar = ({ url, initials, size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'w-24 h-24' : size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
    return (
        <div className={`candidate-avatar ${sizeClass}`}>
          {url ? <img src={url} alt="Company avatar" /> : <span>{initials}</span>}
        </div>
    );
  };

  const firstInitial = (companySettings.companyName || 'C').charAt(0).toUpperCase();
  const avatarUrl = logoPreview || '';

  return (
    <div className="company-dashboard min-h-screen bg-gray-50">
        {isLoading ? (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading company profile...</p>
            </div>
        ) : (
            <>
              <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <PortalLogoBadge size={76} imageScale={0.7} />
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">Skill4Hire</h1>
                        <p className="text-xs text-gray-600">Company Portal</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                          type="button"
                          className="btn btn-primary topbar-action"
                          onClick={() => {
                            setEditingJob(null);
                            setShowJobForm(true);
                          }}
                      >
                        <FiPlus /> Post Job
                      </button>

                      <div className="notification-wrapper">
                        <button
                            type="button"
                            className="notifications-btn"
                            onClick={() => setActiveTab('notifications')}
                            aria-label="Notifications"
                        >
                          <FiBell />
                          {unreadNotifications > 0 && (
                              <span className="notifications-badge">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                          )}
                        </button>
                      </div>

                      <div className="candidate-header-card">
                        <Avatar url={avatarUrl} initials={firstInitial} size="sm" />
                        <div>
                          <p className="candidate-header-name">{companySettings.companyName || 'Your Company'}</p>
                          <p className="candidate-header-role">{companySettings.industry || 'Industry not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-6">
                  <aside className="w-64 flex-shrink-0">
                    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sticky top-24">
                      <button
                          onClick={() => setActiveTab('overview')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                              activeTab === 'overview' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <FiBarChart2 className="w-5 h-5" />
                        Overview
                      </button>
                      <button
                          onClick={() => setActiveTab('jobs')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                              activeTab === 'jobs' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <FiBriefcase className="w-5 h-5" />
                        Job Postings
                      </button>
                      <button
                          onClick={() => setActiveTab('applicants')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                              activeTab === 'applicants' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <FiUsers className="w-5 h-5" />
                        Applicants
                      </button>
                      <button
                          onClick={() => setActiveTab('recommendations')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                              activeTab === 'recommendations' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <FiStar className="w-5 h-5" />
                        Recommendations
                      </button>
                      <button
                          onClick={() => setActiveTab('notifications')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                              activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <FiBell className="w-5 h-5" />
                        <span className="flex items-center gap-2">
                          Notifications
                          {unreadNotifications > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                              </span>
                          )}
                        </span>
                      </button>
                      <button
                          onClick={() => setActiveTab('settings')}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                              activeTab === 'settings' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <FiSettings className="w-5 h-5" />
                        Settings
                      </button>

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition btn-logout"
                          onClick={handleLogout}
                      >
                        <FiLogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </nav>
                  </aside>

                  <main className="flex-1 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Active Jobs</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{jobPostings.length}</p>
                                  </div>
                                  <div className="p-3 bg-blue-100 rounded-lg">
                                    <FiBriefcase className="w-6 h-6 text-blue-600" />
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Applicants</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{applicants.length}</p>
                                  </div>
                                  <div className="p-3 bg-green-100 rounded-lg">
                                    <FiUsers className="w-6 h-6 text-green-600" />
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Recommendations</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{recommendations.length}</p>
                                  </div>
                                  <div className="p-3 bg-purple-100 rounded-lg">
                                    <FiStar className="w-6 h-6 text-purple-600" />
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600">Profile Complete</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {Math.round(
                                          ((companySettings.companyName ? 20 : 0) +
                                              (companySettings.industry ? 20 : 0) +
                                              (companySettings.description ? 20 : 0) +
                                              (companySettings.logo ? 20 : 0) +
                                              (companySettings.website ? 20 : 0))
                                      )}%
                                    </p>
                                  </div>
                                  <div className="p-3 bg-orange-100 rounded-lg">
                                    <FiBarChart2 className="w-6 h-6 text-orange-600" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Company Name</p>
                                  <p className="font-medium">{companySettings.companyName || 'Not set'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Industry</p>
                                  <p className="font-medium">{companySettings.industry || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Company Size</p>
                                  <p className="font-medium">{companySettings.companySize || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Founded</p>
                                  <p className="font-medium">{companySettings.founded || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Website</p>
                                  <p className="font-medium">
                                    {companySettings.website ? (
                                        <a href={companySettings.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                          {companySettings.website}
                                        </a>
                                    ) : 'Not set'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Location</p>
                                  <p className="font-medium">
                                    {[companySettings.city, companySettings.state, companySettings.country]
                                        .filter(Boolean).join(', ') || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                              {companySettings.description && (
                                  <div className="mt-4">
                                    <p className="text-sm text-gray-600">Description</p>
                                    <p className="mt-1 text-gray-900">{companySettings.description}</p>
                                  </div>
                              )}
                            </div>
                          </div>
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          {showJobForm ? (
                              <JobForm
                                  jobId={editingJob?.id}
                                  initialJob={editingJob}
                                  onSave={handleJobSave}
                                  onCancel={handleJobFormCancel}
                              />
                          ) : (
                              <>
                                <div className="flex items-center justify-between mb-6">
                                  <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
                                  <div className="flex gap-2">
                                    <button
                                        className="btn-secondary"
                                        onClick={loadJobPostings}
                                        disabled={jobsLoading}
                                        title="Refresh job postings"
                                    >
                                      <FiRefreshCw />
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreateNewJob}
                                        disabled={jobsLoading}
                                    >
                                      <FiPlus /> Post New Job
                                    </button>
                                  </div>
                                </div>

                                {jobError && (
                                    <div className="error-message mb-4">
                                      <FiAlertTriangle />
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
                                        <FiLoader className="spin" />
                                      </div>
                                      <p>Loading job postings...</p>
                                    </div>
                                ) : jobPostings.length === 0 ? (
                                    <div className="empty-state">
                                      <FiBriefcase />
                                      <h3>No job postings yet</h3>
                                      <p>Create your first job posting to start attracting candidates.</p>
                                      <button
                                          className="btn btn-primary"
                                          onClick={handleCreateNewJob}
                                      >
                                        <FiPlus /> Post Your First Job
                                      </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                <FiEye /> View Details
                                              </button>
                                              <button
                                                  className="btn-secondary"
                                                  onClick={() => handleEditJob(job)}
                                              >
                                                <FiEdit /> Edit
                                              </button>
                                              <button
                                                  className="btn-danger"
                                                  onClick={() => handleDeleteJob(job.id)}
                                                  disabled={jobsLoading}
                                              >
                                                <FiTrash2 /> Delete
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
                                            <FiX />
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
                                            <FiEdit /> Edit Job
                                          </button>
                                          <button
                                              className="btn-danger"
                                              onClick={() => {
                                                handleCloseJobDetails();
                                                handleDeleteJob(selectedJob.id);
                                              }}
                                          >
                                            <FiTrash2 /> Delete Job
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

                    {activeTab === 'applicants' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
                            <div className="flex gap-2">
                              <select
                                  value={selectedApplicantsJob}
                                  onChange={(e) => setSelectedApplicantsJob(e.target.value)}
                                  className="apps-select"
                                  title="Filter by job"
                              >
                                <option value="all">All jobs</option>
                                {jobPostings.map((job) => (
                                    <option key={job.id} value={job.id}>{job.title || job.jobTitle || 'Untitled'}</option>
                                ))}
                              </select>
                              <select
                                  value={applicantStatusFilter}
                                  onChange={(e) => setApplicantStatusFilter(e.target.value)}
                                  className="apps-select"
                                  title="Filter by status"
                              >
                                <option value="all">All statuses</option>
                                <option value="APPLIED">Applied</option>
                                <option value="SHORTLISTED">Shortlisted</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="HIRED">Hired</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                              <button className="btn-secondary" onClick={loadApplicants} disabled={applicantsLoading}>
                                <FiRefreshCw /> Refresh
                              </button>
                            </div>
                          </div>

                          {applicantsError && (
                              <div className="error-message mb-4">
                                <FiAlertTriangle /> {applicantsError}
                              </div>
                          )}
                          {applicantsLoading && (
                              <div className="loading-container">
                                <div className="loading-spinner"><FiLoader className="spin" /></div>
                                <p>Loading applicants...</p>
                              </div>
                          )}
                          {!applicantsLoading && applicants.length === 0 && !applicantsError && (
                              <div className="empty-state">
                                <p>No applicants found for the selected filters.</p>
                              </div>
                          )}

                          {!applicantsLoading && applicants.length > 0 && (
                              <div className="apps-table-wrapper">
                                <table className="apps-table">
                                  <thead>
                                  <tr>
                                    <th>Candidate</th>
                                    <th>Job</th>
                                    <th>Location</th>
                                    <th>Applied</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  {applicants.map((a) => (
                                      <tr key={a.id}>
                                        <td>{a.candidateId}</td>
                                        <td>{a.jobTitle}</td>
                                        <td className="muted">{a.location}</td>
                                        <td className="muted">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}</td>
                                        <td>
                                          <span className={`status-badge ${String(a.status).toLowerCase()}`}>{a.status}</span>
                                        </td>
                                        <td>
                                          <div className="flex gap-2">
                                            <button
                                                className="btn-outline small"
                                                disabled={a.status === 'SHORTLISTED'}
                                                onClick={() => handleUpdateApplicationStatus(a.id, 'SHORTLISTED')}
                                            >
                                              Shortlist
                                            </button>
                                            <button
                                                className="btn-outline small"
                                                disabled={a.status === 'INTERVIEW'}
                                                onClick={() => handleUpdateApplicationStatus(a.id, 'INTERVIEW')}
                                            >
                                              Interview
                                            </button>
                                            <button
                                                className="btn-outline small"
                                                disabled={a.status === 'HIRED'}
                                                onClick={() => handleUpdateApplicationStatus(a.id, 'HIRED')}
                                            >
                                              Hire
                                            </button>
                                            <button
                                                className="btn-danger small"
                                                disabled={a.status === 'REJECTED'}
                                                onClick={() => handleUpdateApplicationStatus(a.id, 'REJECTED')}
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                  ))}
                                  </tbody>
                                </table>
                              </div>
                          )}
                        </div>
                    )}

                    {activeTab === 'recommendations' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Candidate Recommendations</h2>
                            <div className="flex gap-2">
                              <select
                                  value={selectedRecommendationJob}
                                  onChange={(event) => setSelectedRecommendationJob(event.target.value)}
                                  className="apps-select"
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
                                  className="btn-secondary"
                                  onClick={() => loadRecommendations(selectedRecommendationJob)}
                              >
                                <FiRefreshCw /> Refresh
                              </button>
                            </div>
                          </div>

                          {recommendationsLoading && (
                              <div className="loading-container">
                                <FiLoader className="spin" />
                                <p>Fetching recommended candidates...</p>
                              </div>
                          )}

                          {!recommendationsLoading && recommendationsError && (
                              <div className="error-message mb-4">
                                <FiAlertTriangle />
                                <span>{recommendationsError}</span>
                              </div>
                          )}

                          {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
                              <div className="empty-state">
                                <p>No recommendations available yet. Post a job or adjust your filters to see matches.</p>
                              </div>
                          )}

                          {!recommendationsLoading && !recommendationsError && recommendations.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                <FiDownload /> Resume
                                              </a>
                                          )}
                                          {rec.email && (
                                              <a href={`mailto:${rec.email}`} className="btn-primary small">
                                                <FiMail /> Contact
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

                    {activeTab === 'notifications' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                            <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-outline small"
                                  onClick={handleMarkAllNotificationsRead}
                                  disabled={!unreadNotifications || notificationsLoading}
                              >
                                <FiCheck /> Mark all read
                              </button>
                              <button
                                  type="button"
                  className="btn-secondary"
                                  onClick={handleRefreshNotifications}
                                  disabled={notificationsLoading}
                              >
                                <FiRefreshCw /> Refresh
                              </button>
                            </div>
                          </div>

                          {notificationsLoading && (
                              <div className="notifications-loading">
                                <FiLoader className="spin" />
                                <span>Loading notifications...</span>
                              </div>
                          )}

                          {!notificationsLoading && notificationsError && (
                              <div className="notifications-error mb-4">
                                <FiAlertTriangle />
                                <span>{notificationsError}</span>
                              </div>
                          )}

                          {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                              <div className="notifications-empty">
                                <FiInbox />
                                <p>No notifications yet</p>
                              </div>
                          )}

                          {!notificationsLoading && !notificationsError && notifications.length > 0 && (
                              <ul className="notifications-list">
                                {notifications.map((notification, index) => {
                                  const notificationId = notification.id || notification._id || `notification-${index}`;
                                  const isRead = Boolean(notification.read);
                                  return (
                                      <li
                                          key={notificationId}
                                          className={`notification-item ${isRead ? 'read' : 'unread'}`}
                                      >
                                        <div className="notification-main">
                                          <p className="notification-message">{notification.message}</p>
                                          <div className="notification-meta">
                                            <span className="notification-time">
                                              <FiClock /> {formatNotificationTime(notification.createdAt)}
                                            </span>
                                            {notification.jobPostId && (
                                                <span className="notification-job">
                                                  Job: {getJobTitle(notification.jobPostId) || notification.jobPostId}
                                                </span>
                                            )}
                                            {notification.type && (
                                                <span className="notification-type">
                                                  {notification.type.replace(/_/g, ' ')}
                                                </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="notification-item-actions">
                                          {!isRead && (
                                              <button
                                                  type="button"
                                                  className="btn-outline small"
                                                  onClick={() => handleMarkNotificationRead(notificationId)}
                                              >
                                                <FiCheck /> Mark read
                                              </button>
                                          )}
                                          <button
                                              type="button"
                                              className="btn-danger small"
                                              onClick={() => handleDeleteNotification(notificationId)}
                                          >
                                            <FiTrash2 /> Dismiss
                                          </button>
                                        </div>
                                      </li>
                                  );
                                })}
                              </ul>
                          )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
                            <div className="flex items-center gap-4">
                              {saveMessage && (
                                  <div className={`save-message ${saveStatus}`}>
                                    {saveStatus === 'success' && <FiCheck />}
                                    {saveStatus === 'error' && <FiAlertTriangle />}
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
                                      <FiLoader className="spinning" /> Saving...
                                    </>
                                ) : (
                                    <>
                                      <FiSave /> Save All Changes
                                    </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {/* Company Logo Section */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiImage /> Company Logo
                              </h3>
                              <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex flex-col items-center gap-4">
                                  {logoPreview ? (
                                      <div className="logo-preview-container">
                                        <img src={logoPreview} alt="Company Logo Preview" className="logo-preview" />
                                        <button
                                            type="button"
                                            className="remove-logo-btn"
                                            onClick={handleRemoveLogo}
                                            title="Remove logo"
                                        >
                                          <FiX />
                                        </button>
                                      </div>
                                  ) : (
                                      <div className="logo-placeholder">
                                        <FiImage />
                                        <span>No logo uploaded</span>
                                      </div>
                                  )}
                                </div>
                                <div className="flex-1">
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
                                            <FiLoader className="spinning" /> Uploading...
                                          </>
                                      ) : (
                                          <>
                                            <FiUploadCloud /> {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                          </>
                                      )}
                                    </label>
                                    <p className="upload-hint mt-2">
                                      Recommended: 200x200px, max 5MB (PNG, JPG, SVG)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Basic Company Information */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiInfo /> Basic Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                                  <input
                                      type="text"
                                      value={companySettings.companyName}
                                      onChange={(e) => handleBasicSettingsChange('companyName', e.target.value)}
                                      className="form-input"
                                      placeholder="Enter company name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                                  <select
                                      value={companySettings.industry}
                                      onChange={(e) => handleBasicSettingsChange('industry', e.target.value)}
                                      className="form-input"
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
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                                  <select
                                      value={companySettings.companySize}
                                      onChange={(e) => handleBasicSettingsChange('companySize', e.target.value)}
                                      className="form-input"
                                  >
                                    <option value="">Select Size</option>
                                    <option value="1-10 employees">1-10 employees</option>
                                    <option value="11-50 employees">11-50 employees</option>
                                    <option value="51-100 employees">51-100 employees</option>
                                    <option value="100-500 employees">100-500 employees</option>
                                    <option value="500+ employees">500+ employees</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                                  <input
                                      type="number"
                                      value={companySettings.founded}
                                      onChange={(e) => handleBasicSettingsChange('founded', e.target.value)}
                                      className="form-input"
                                      placeholder="e.g., 2018"
                                      min="1800"
                                      max={new Date().getFullYear()}
                                  />
                                </div>
                              </div>
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                                <textarea
                                    value={companySettings.description}
                                    onChange={(e) => handleBasicSettingsChange('description', e.target.value)}
                                    className="form-textarea"
                                    placeholder="Describe your company, mission, and values..."
                                    rows="4"
                                />
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiMail /> Contact Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                  <div className="input-with-icon">
                                    <FiMail />
                                    <input
                                        type="email"
                                        value={companySettings.email}
                                        onChange={(e) => handleBasicSettingsChange('email', e.target.value)}
                                        placeholder="company@example.com"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                  <div className="input-with-icon">
                                    <FiPhone />
                                    <input
                                        type="tel"
                                        value={companySettings.phone}
                                        onChange={(e) => handleBasicSettingsChange('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                  <div className="input-with-icon">
                                    <FiGlobe />
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

                            {/* Account Security */}
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiShield /> Account Security
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <button
                                    className="btn-secondary"
                                    onClick={handlePasswordChange}
                                >
                                  <FiLock /> Change Password
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={handleEmailUpdate}
                                >
                                  <FiMail /> Update Email
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={handleAccountDeletion}
                                >
                                  <FiTrash2 /> Delete Account
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                    )}
                  </main>
                </div>
              </div>
            </>
        )}
      </div>
  );
};

export default CompanyDashboard;