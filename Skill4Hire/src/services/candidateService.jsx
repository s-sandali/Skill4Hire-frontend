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
      // Map frontend fields to backend DTO structure
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
        notificationPreferences: profileData.notificationPreferences || {}
      };
      
      const response = await apiClient.put('/api/candidates/profile', backendProfileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // Check if profile is complete - FIXED response mapping
  checkProfileCompleteness: async () => {
    try {
      const response = await apiClient.get('/api/candidates/profile/completeness');
      // Map backend response to frontend expectation
      return {
        completeness: response.data.completenessPercentage || 0,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check profile completeness');
    }
  },

  // Skills Management - FIXED parameter name
  addSkill: async (skill) => {
    try {
      const response = await apiClient.post('/api/candidates/skills', null, {
        params: { skill } // Matches backend @RequestParam("skill")
      });
      const data = response.data;
      return Array.isArray(data) ? data : (data?.skills ?? []);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add skill');
    }
  },

  removeSkill: async (skill) => {
    try {
      const response = await apiClient.delete(`/api/candidates/skills/${encodeURIComponent(skill)}`);
      const data = response.data;
      return Array.isArray(data) ? data : (data?.skills ?? []);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove skill');
    }
  },

  // File Uploads (unchanged - these are correct)
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

  // Applications (unchanged)
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

  // Notifications (unchanged)
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