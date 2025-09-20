import apiClient from '../utils/axiosConfig';

export const authService = {
  // Unified login
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Candidate registration
  registerCandidate: async (userData) => {
    try {
      const response = await apiClient.post('/candidates/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Company registration
  registerCompany: async (userData) => {
    try {
      const response = await apiClient.post('/companies/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Employee registration
  registerEmployee: async (userData) => {
    try {
      const response = await apiClient.post('/employees/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Admin registration
  registerAdmin: async (userData) => {
    try {
      const response = await apiClient.post('/admins/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }
};