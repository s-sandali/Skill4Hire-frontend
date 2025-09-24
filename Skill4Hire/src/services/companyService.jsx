import apiClient from '../utils/axiosConfig';

export const companyService = {
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
      // profileData must be flat and match CompanyProfileDTO exactly
      // Example:
      // { name, description, phone, website, address, facebook, linkedin, twitter, logo }
      const response = await apiClient.put('/api/companies/profile', profileData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error("Error saving settings:", error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to update company profile');
    }
  },

  uploadLogo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/api/companies/upload/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error uploading logo');
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.post('/api/companies/change-password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error changing password');
    }
  },

  updateEmail: async (newEmail) => {
    try {
      const response = await apiClient.post('/api/companies/update-email', {
        newEmail
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating email');
    }
  },

  deleteAccount: async () => {
    try {
      const response = await apiClient.delete('/api/companies/delete-account');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting account');
    }
  }
};
