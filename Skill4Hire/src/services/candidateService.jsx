import apiClient from '../utils/axiosConfig';

const isAbsoluteUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

const normalizeBaseUrl = () => {
  const base = apiClient?.defaults?.baseURL || '';
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const sanitizePath = (path) => path.replace(/\\/g, '/');

const ensureLeadingSlash = (value) => (value.startsWith('/') ? value : `/${value}`);

const buildAssetUrl = (raw, fallbackFolder) => {
  if (!raw) return '';
  if (isAbsoluteUrl(raw)) return raw;

  let normalized = sanitizePath(String(raw).trim());

  if (!normalized) return '';

  if (normalized.startsWith('/api/uploads/')) {
    normalized = normalized.replace(/^\/api/, '');
  }

  if (normalized.startsWith('/uploads/')) {
    const base = normalizeBaseUrl();
    return base ? `${base}${normalized}` : normalized;
  }

  if (normalized.startsWith('uploads/')) {
    const base = normalizeBaseUrl();
    const path = ensureLeadingSlash(normalized);
    return base ? `${base}${path}` : path;
  }

  const hasSubPath = normalized.includes('/');
  const folderSegment = hasSubPath ? normalized.replace(/^\/+/, '') : `${fallbackFolder}/${normalized.replace(/^\/+/, '')}`;
  const fullPath = `/uploads/${folderSegment}`;
  const base = normalizeBaseUrl();
  return base ? `${base}${fullPath}` : fullPath;
};

const normalizeProfileAssetFields = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return profile;
  }

  const normalized = { ...profile };

  const resumeCandidates = [
    profile.resumeUrl,
    profile.resumeDownloadUrl,
    profile.resumeDownloadPath,
    profile.resumePath,
    profile.resumeFileName,
  ].filter(Boolean);

  const resolvedResumeUrl = resumeCandidates.map((candidate) => buildAssetUrl(candidate, 'resumes')).find(Boolean) || '';
  if (resolvedResumeUrl) {
    normalized.resumeUrl = resolvedResumeUrl;
    normalized.resumeDownloadUrl = resolvedResumeUrl;
  }

  if (!normalized.resumeFileName) {
    normalized.resumeFileName = profile.resumeFileName || profile.resumePath || '';
  }

  const pictureCandidates = [
    profile.profilePictureUrl,
    profile.profilePicturePath,
    profile.profilePicture,
    profile.photoUrl,
    profile.avatarUrl,
  ].filter(Boolean);

  const resolvedPictureUrl = pictureCandidates.map((candidate) => buildAssetUrl(candidate, 'profile-pictures')).find(Boolean) || '';
  if (resolvedPictureUrl) {
    normalized.profilePictureUrl = resolvedPictureUrl;
  }

  return normalized;
};

const wrapUploadResponse = (data, folder) => {
  if (!data || typeof data !== 'object') return data;
  const wrapped = { ...data };
  const candidates = [data.downloadUrl, data.url, data.fileName, data.filename, data.path].filter(Boolean);
  const resolvedUrl = candidates.map((candidate) => buildAssetUrl(candidate, folder)).find(Boolean) || '';
  if (resolvedUrl) {
    wrapped.downloadUrl = resolvedUrl;
    wrapped.url = resolvedUrl;
    if (folder === 'profile-pictures') {
      wrapped.imageUrl = resolvedUrl;
      wrapped.profilePictureUrl = resolvedUrl;
    }
  }
  if (!wrapped.fileName) {
    wrapped.fileName = data.filename || '';
  }
  return wrapped;
};

export const candidateService = {
  // Profile
  getProfile: async () => {
    const response = await apiClient.get('/api/candidates/profile');
    return normalizeProfileAssetFields(response.data);
  },

  updateProfile: async (profileData) => {
    const backendProfileData = {
      name: profileData.name,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber || profileData.phone,
      location: profileData.location,
      title: profileData.title,
      headline: profileData.headline || profileData.bio,
      skills: profileData.skills,
      education: profileData.education,
      experience: profileData.experience,
      jobPreferences: profileData.jobPreferences || {},
      notificationPreferences: profileData.notificationPreferences || {},
    };
    const response = await apiClient.put('/api/candidates/profile', backendProfileData);
    return normalizeProfileAssetFields(response.data);
  },

  // Completeness
  checkProfileCompleteness: async () => {
    const response = await apiClient.get('/api/candidates/profile/completeness');
    return {
      completeness: response.data.completenessPercentage || 0,
      message: response.data.message,
    };
  },

  // Skills
  addSkill: async (skill) => {
    const response = await apiClient.post('/api/candidates/skills', null, { params: { skill } });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.skills ?? []);
  },

  removeSkill: async (skill) => {
    const response = await apiClient.delete(`/api/candidates/skills/${encodeURIComponent(skill)}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.skills ?? []);
  },

  // Files
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await apiClient.post('/api/candidates/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return wrapUploadResponse(response.data, 'resumes');
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await apiClient.post('/api/candidates/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return wrapUploadResponse(response.data, 'profile-pictures');
  },

  // Applications
  getApplications: async () => {
    const response = await apiClient.get('/api/candidates/applications');
    return response.data;
  },

  applyToJob: async (jobId) => {
    if (!jobId) throw new Error('Missing job identifier');
    try {
      const response = await apiClient.post('/api/candidates/applications', { jobPostId: jobId });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) return { alreadyApplied: true };
      if (status === 404) throw new Error('Application endpoint or job not found. Please refresh and try again.');
      throw new Error(error.response?.data?.message || 'Failed to apply to job');
    }
  },

  // Notifications
  getNotifications: async () => {
    const response = await apiClient.get('/api/candidates/notifications');
    return response.data;
  },

  getUnreadNotificationCount: async () => {
    const response = await apiClient.get('/api/candidates/notifications/count');
    return response.data;
  },

  markNotificationAsRead: async (notificationId) => {
    await apiClient.post(`/api/candidates/notifications/${notificationId}/read`);
    return true;
  },
  markAllNotificationsAsRead: async () => {
    await apiClient.post(`/api/candidates/notifications/read-all`);
    return true;
  },
};
