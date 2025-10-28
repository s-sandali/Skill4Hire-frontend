import apiClient from '../utils/axiosConfig';

export const candidateService = {
  // Profile
  getProfile: async () => {
    const response = await apiClient.get('/api/candidates/profile');
    return response.data;
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
    return response.data;
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
    const response = await apiClient.post('/api/candidates/upload/resume', formData);
    return response.data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await apiClient.post('/api/candidates/upload/profile-picture', formData);
    return response.data;
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

  markNotificationAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/api/candidates/notifications/${notificationId}/read`);
    return response.data;
  },
};
