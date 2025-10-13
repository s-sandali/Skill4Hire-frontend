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
      // Map and sanitize to match CompanyProfileDTO fields exactly
      const toAddressLine = (data) => {
        // Prefer a precomposed address if present
        if (data.address && !data.city && !data.state && !data.zipCode && !data.country) return data.address;
        const parts = [
          data.address,
          [data.city, data.state].filter(Boolean).join(', '),
          data.zipCode,
          data.country
        ].filter(Boolean);
        return parts.join(', ');
      };

      const payload = {
        name: profileData.name ?? profileData.companyName ?? '',
        description: profileData.description ?? '',
        phone: profileData.phone ?? profileData.phoneNumber ?? '',
        website: profileData.website ?? '',
        address: toAddressLine(profileData),
        facebook: profileData.facebook ?? profileData.facebookUrl ?? '',
        linkedin: profileData.linkedin ?? profileData.linkedinUrl ?? '',
        twitter: profileData.twitter ?? profileData.twitterUrl ?? '',
        logo: profileData.logo ?? ''
      };

      const response = await apiClient.put('/api/companies/profile', payload, {
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

  // Backward compatible alias used by CompanyDashboard
  updateLogo: async (file) => {
    return companyService.uploadLogo(file);
  },

  changePassword: async (...args) => {
    try {
      // Accept either (oldPassword, newPassword) or ({ currentPassword, newPassword, confirmPassword })
      let payload;
      if (args.length === 1 && typeof args[0] === 'object') {
        const { currentPassword, oldPassword, newPassword } = args[0] || {};
        payload = {
          oldPassword: currentPassword ?? oldPassword,
          newPassword,
        };
      } else {
        const [oldPassword, newPassword] = args;
        payload = { oldPassword, newPassword };
      }
      const response = await apiClient.post('/api/companies/change-password', payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error changing password');
    }
  },

  updateEmail: async (arg) => {
    try {
      const newEmail = typeof arg === 'object' ? arg?.newEmail : arg;
      const response = await apiClient.post('/api/companies/update-email', { newEmail });
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
  },

  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/api/companies/recommendations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  },

  getRecommendationsForJob: async (jobId) => {
    try {
      if (!jobId) {
        throw new Error('Missing job identifier');
      }
      const response = await apiClient.get(`/api/companies/jobs/${jobId}/recommendations`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job recommendations');
    }
  },

  // ================= Applicants Management =================
  getApplications: async (status) => {
    try {
      const params = status ? { status } : undefined;
      const { data } = await apiClient.get('/api/companies/applications', { params });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  getJobApplications: async (jobId, status) => {
    try {
      if (!jobId) throw new Error('Missing job identifier');
      const params = status ? { status } : undefined;
      const { data } = await apiClient.get(`/api/companies/jobs/${jobId}/applications`, { params });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch job applications');
    }
  },

  updateApplicationStatus: async (applicationId, status, reason) => {
    try {
      if (!applicationId) throw new Error('Missing application identifier');
      if (!status) throw new Error('Missing status');
      const payload = { status, reason };
      const { data } = await apiClient.put(`/api/companies/applications/${applicationId}/status`, payload);
      return data;
    } catch (error) {
      const code = error.response?.status;
      if (code === 400) {
        throw new Error(error.response?.data?.message || 'Bad request: invalid status or missing reason');
      }
      if (code === 403) {
        throw new Error('You do not have permission to update this application');
      }
      if (code === 404) {
        throw new Error('Application not found');
      }
      throw new Error(error.response?.data?.message || 'Failed to update application status');
    }
  }
};
