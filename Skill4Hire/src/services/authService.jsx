import apiClient from '../utils/axiosConfig';
export const authService = {
  // Unified login - determines role and calls appropriate endpoint
  login: async (email, password) => {
    try {
      // Try to determine role from email or use a default approach
      const domain = email.split('@')[1]?.toLowerCase();
      let loginEndpoint = '/api/candidates/auth/login'; // default
      
      if (domain?.includes('admin') || domain?.includes('skill4hire')) {
        loginEndpoint = '/api/admin/auth/login';
      } else if (domain?.includes('company') || domain?.includes('corp') || domain?.includes('inc')) {
        loginEndpoint = '/api/companies/auth/login';
      } else if (domain?.includes('hr') || domain?.includes('employee')) {
        loginEndpoint = '/api/employees/auth/login';
      }
      
      const response = await apiClient.post(loginEndpoint, {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Individual role login methods
  loginCandidate: async (email, password) => {
    try {
      const response = await apiClient.post('/api/candidates/auth/login', {
        email,
        password
      });
      const data = response.data || {};
      const id = data.id || data.userId || data.candidateId;
      // Persist
      localStorage.setItem('userRole', 'CANDIDATE');
      if (id != null) localStorage.setItem('userId', String(id));
      return { success: true, role: 'CANDIDATE', id, data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Candidate login failed');
    }
  },
  loginCompany: async (email, password) => {
    try {
      const response = await apiClient.post('/api/companies/auth/login', {
        email,
        password
      });

      const data = response.data || {};
      const id = data.id || data.userId || data.companyId;

      // 👉 Save to localStorage
      localStorage.setItem('userRole', 'COMPANY');
      if (id != null) {
        localStorage.setItem('userId', String(id));
        // keep companyId for convenience if present
        localStorage.setItem('companyId', String(id));
      }

      // Normalized payload for callers (UnifiedLogin expects success/role/id)
      return { success: true, role: 'COMPANY', id, data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Company login failed');
    }
  },

  loginEmployee: async (email, password) => {
    try {
      const response = await apiClient.post('/api/employees/auth/login', {
        email,
        password
      });
      const data = response.data || {};
      const id = data.id || data.userId || data.employeeId;
      localStorage.setItem('userRole', 'EMPLOYEE');
      if (id != null) localStorage.setItem('userId', String(id));
      return { success: true, role: 'EMPLOYEE', id, data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Employee login failed');
    }
  },

  loginAdmin: async (email, password) => {
    try {
      const response = await apiClient.post('/api/admin/auth/login', {
        email,
        password
      });
      const data = response.data || {};
      const id = data.id || data.userId || data.adminId;
      localStorage.setItem('userRole', 'ADMIN');
      if (id != null) localStorage.setItem('userId', String(id));
      return { success: true, role: 'ADMIN', id, data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Admin login failed');
    }
  },

  
  
  
  // Candidate registration
  registerCandidate: async (userData) => {
    try {
      const response = await apiClient.post('/api/candidates/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Company registration
  registerCompany: async (userData) => {
    try {
      const response = await apiClient.post('/api/companies/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Employee registration
  registerEmployee: async (userData) => {
    try {
      const response = await apiClient.post('/api/employees/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Admin registration
  registerAdmin: async (userData) => {
    try {
      const response = await apiClient.post('/api/admin/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout - determines role and calls appropriate endpoint
  logout: async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      let logoutEndpoint = '/api/candidates/auth/logout'; // default
      
      switch (userRole) {
        case 'COMPANY':
          logoutEndpoint = '/api/companies/auth/logout';
          break;
        case 'EMPLOYEE':
          logoutEndpoint = '/api/employees/auth/logout';
          break;
        case 'ADMIN':
          logoutEndpoint = '/api/admin/auth/logout';
          break;
        default:
          logoutEndpoint = '/api/candidates/auth/logout';
      }
      
      const response = await apiClient.post(logoutEndpoint);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('companyId');
      return response.data;
    } catch (error) {
      // Clear local storage even if logout fails
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('companyId');
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  // Get current user - determines role and calls appropriate endpoint
  getCurrentUser: async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      let meEndpoint = '/api/candidates/auth/me'; // default
      
      switch (userRole) {
        case 'COMPANY':
          meEndpoint = '/api/companies/auth/me';
          break;
        case 'EMPLOYEE':
          meEndpoint = '/api/employees/auth/me';
          break;
        case 'ADMIN':
          meEndpoint = '/api/admin/auth/me';
          break;
        default:
          meEndpoint = '/api/candidates/auth/me';
      }
      
      const response = await apiClient.get(meEndpoint);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }
};


