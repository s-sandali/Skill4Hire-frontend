// src/services/jobService.js - Cleaned up version
import axios from "axios";

const API_URL = "http://localhost:8080/api/jobposts";

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // include cookies/session
});

const normalizeJob = (job) => {
  if (!job) return null;
  const normalizedId = job.id || job._id || job.jobId;
  return normalizedId ? { ...job, id: normalizedId } : { ...job };
};

// Interceptor for handling responses & errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        console.warn("🚫 Job service request rejected:", status, error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export const jobService = {
  // Get all jobs for the company (for dashboard)
  getAll: async () => {
    try {
      console.log('📤 Fetching company jobs from /my-jobs');
  const res = await api.get("/my-jobs");
  console.log('📦 Jobs response:', res.data);
  const payload = Array.isArray(res.data) ? res.data : [];
  return payload.map(normalizeJob);
    } catch (err) {
      console.error("❌ Job getAll failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Get job by ID (public endpoint - works for both company and candidates)
  getById: async (id) => {
    try {
      console.log('📤 Fetching job by ID:', id);
  const res = await api.get(`/${id}`);
  console.log('📦 Job detail response:', res.data);
  return normalizeJob(res.data);
    } catch (err) {
      console.error("❌ Job getById failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Create new job
  create: async (job) => {
    try {
      console.log('📤 Creating job:', job);
  const res = await api.post("", job);
  console.log('✅ Job created:', res.data);
  return normalizeJob(res.data);
    } catch (err) {
      console.error("❌ Job create failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Update existing job
  update: async (id, job) => {
    try {
      console.log('📤 Updating job:', id, job);
  const res = await api.put(`/${id}`, job);
  console.log('✅ Job updated:', res.data);
  return normalizeJob(res.data);
    } catch (err) {
      console.error("❌ Job update failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Delete job
  remove: async (id) => {
    try {
      console.log('📤 Deleting job:', id);
      await api.delete(`/${id}`);
      console.log('✅ Job deleted successfully');
    } catch (err) {
      console.error("❌ Job delete failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Get public job listings (no auth required)
  listPublic: async (params = {}) => {
    try {
  const res = await api.get("", { params });
  const payload = Array.isArray(res.data) ? res.data : [];
  return payload.map(normalizeJob);
    } catch (err) {
      console.error("❌ Public job list failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Search jobs (public endpoint)
  search: async (params = {}) => {
    try {
  const res = await api.get("/search", { params });
  const payload = Array.isArray(res.data) ? res.data : [];
  return payload.map(normalizeJob);
    } catch (err) {
      console.error("❌ Job search failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Skill-matched search for authenticated candidates
  searchWithMatching: async (params = {}) => {
    try {
      const res = await api.get("/search/with-matching", { params });
      const payload = Array.isArray(res.data) ? res.data : [];
      return payload.map((item) => {
        if (!item) return item;
        if (item.job) {
          return {
            ...item,
            job: normalizeJob(item.job)
          };
        }
        return normalizeJob(item);
      });
    } catch (err) {
      console.error("❌ Job matching search failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const res = await api.get("/filter-options");
      return res.data;
    } catch (err) {
      console.error("❌ Get filter options failed:", err.response?.data || err.message);
      throw err;
    }
  }
};