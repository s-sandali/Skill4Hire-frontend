import apiClient from '../utils/axiosConfig';

export const companyService = {
  // Profile Management
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/companies/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company profile');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/api/companies/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company profile');
    }
  },

  // Company Logo Management
  uploadLogo: async (file) => {
    try {
      // Validate file before upload
      if (!file) {
        throw new Error('No file selected');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await apiClient.post('/api/companies/logo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload logo');
    }
  },

  updateLogo: async (file) => {
    try {
      if (!file) {
        throw new Error('No file selected');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await apiClient.put('/api/companies/logo/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update logo');
    }
  },

  removeLogo: async () => {
    try {
      const response = await apiClient.delete('/api/companies/logo/remove');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove logo');
    }
  },

  getLogo: async () => {
    try {
      const response = await apiClient.get('/api/companies/logo');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch logo');
    }
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    try {
      const response = await apiClient.get('/api/companies/notifications/preferences');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification preferences');
    }
  },

  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/api/companies/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
    }
  },

  // Account Security
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/api/companies/password/change', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  updateEmail: async (emailData) => {
    try {
      const response = await apiClient.put('/api/companies/email/update', {
        newEmail: emailData.newEmail,
        password: emailData.password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update email');
    }
  },

  deleteAccount: async (confirmationData) => {
    try {
      const response = await apiClient.delete('/api/companies/account', {
        data: {
          password: confirmationData.password,
          confirmation: confirmationData.confirmation
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  },

  // Enable/disable two-factor authentication
  updateTwoFactor: async (twoFactorData) => {
    try {
      const response = await apiClient.put('/api/companies/two-factor', twoFactorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update two-factor authentication');
    }
  }
};