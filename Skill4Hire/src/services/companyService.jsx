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
        city: profileData.city ?? '',
        state: profileData.state ?? '',
        zipCode: profileData.zipCode ?? '',
        country: profileData.country ?? '',
        facebook: profileData.facebook ?? profileData.facebookUrl ?? '',
        linkedin: profileData.linkedin ?? profileData.linkedinUrl ?? '',
        twitter: profileData.twitter ?? profileData.twitterUrl ?? '',
        industry: profileData.industry ?? profileData.companyIndustry ?? '',
        companySize: profileData.companySize ?? profileData.size ?? '',
        founded: profileData.founded ?? profileData.foundedYear ?? '',
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

  removeLogo: async () => {
    try {
      const response = await apiClient.delete('/api/companies/logo');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error removing logo');
    }
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
      const data = response.data;
      const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
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

  // ================= Notification Centre =================
  getNotifications: async () => {
    try {
      const { data } = await apiClient.get('/api/companies/notifications');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  getUnreadNotifications: async () => {
    try {
      const { data } = await apiClient.get('/api/companies/notifications/unread');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unread notifications');
    }
  },

  getNotificationCount: async () => {
    try {
      const { data } = await apiClient.get('/api/companies/notifications/count');
      return data?.unreadCount ?? 0;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification count');
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      if (!notificationId) throw new Error('Missing notification identifier');
      await apiClient.put(`/api/companies/notifications/${notificationId}/read`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await apiClient.put('/api/companies/notifications/read-all');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notifications as read');
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      if (!notificationId) throw new Error('Missing notification identifier');
      await apiClient.delete(`/api/companies/notifications/${notificationId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
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
  },

  getCandidateBasic: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidate identifier');
    try {
      const { data } = await apiClient.get(`/api/companies/candidates/${candidateId}/basic`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch candidate basic profile');
    }
  },

  getCandidateProfile: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidate identifier');
    try {
      const { data } = await apiClient.get(`/api/companies/candidates/${candidateId}/profile`);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch candidate profile');
    }
  },

  downloadCandidateCv: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidate identifier');
    try {
      const response = await apiClient.get(`/api/companies/candidates/${candidateId}/cv`, { responseType: 'blob' });
      const dispo = response.headers?.['content-disposition'] || response.headers?.get?.('content-disposition');
      let filename = 'resume.pdf';
      if (dispo) {
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^;\"]+)"?/i.exec(dispo);
        filename = decodeURIComponent(match?.[1] || match?.[2] || filename);
      }
      return { blob: response.data, filename };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download candidate CV');
    }
  },
};