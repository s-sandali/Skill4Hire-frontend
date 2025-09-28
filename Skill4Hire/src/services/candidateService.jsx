import apiClient from '../utils/axiosConfig';

export const candidateService = {
  // Profile Management
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/candidates/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/api/candidates/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Check if profile is complete
  checkProfileCompleteness: async () => {
    try {
      const response = await apiClient.get('/api/candidates/profile/completeness');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check profile completeness');
    }
  },

  // Skills Management
  addSkill: async (skill) => {
    try {
      const response = await apiClient.post('/api/candidates/skills', null, {
        params: { skill }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add skill');
    }
  },

  removeSkill: async (skill) => {
    try {
      const response = await apiClient.delete(`/api/candidates/skills/${encodeURIComponent(skill)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove skill');
    }
  },

  // File Uploads
  uploadResume: async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await apiClient.post('/api/candidates/upload/resume', formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload resume');
    }
  },

  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await apiClient.post('/api/candidates/upload/profile-picture', formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  },

  // Applications
  getApplications: async () => {
    try {
      const response = await apiClient.get('/api/candidates/applications');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  applyToJob: async (jobId) => {
    try {
      const response = await apiClient.post(`/api/jobs/${jobId}/apply`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply to job');
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/api/candidates/notifications');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(`/api/candidates/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
};