// src/services/jobService.js - Refactored to use shared api client
import apiClient from "../utils/axiosConfig";

const normalizeJob = (job) => {
  if (!job) return null;
  const normalizedId = job.id || job._id || job.jobId || job.jobPostId;
  return normalizedId ? { ...job, id: normalizedId } : { ...job };
};

export const jobService = {
  // Get all jobs for the company (for dashboard)
  getAll: async () => {
    try {
      console.log('📤 Fetching company jobs from /my-jobs');
      const res = await apiClient.get("/api/jobposts/my-jobs");
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
      const res = await apiClient.get(`/api/jobposts/${id}`);
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
      const res = await apiClient.post("/api/jobposts", job);
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
      const res = await apiClient.put(`/api/jobposts/${id}`, job);
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
      await apiClient.delete(`/api/jobposts/${id}`);
      console.log('✅ Job deleted successfully');
    } catch (err) {
      console.error("❌ Job delete failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Get public job listings (no auth required)
  listPublic: async (params = {}) => {
    try {
      const res = await apiClient.get("/api/jobposts", { params });
      const data = res?.data;
      const payload = Array.isArray(data) ? data : [];
      return payload.map(normalizeJob);
    } catch (err) {
      // If backend returns 204 No Content, treat as empty list
      if (err?.response?.status === 204) return [];
      console.error("❌ Public job list failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Search jobs (public endpoint)
  search: async (params = {}) => {
    try {
      const res = await apiClient.get("/api/jobposts/search", { params });
      const data = res?.data;
      const payload = Array.isArray(data) ? data : [];
      return payload.map(normalizeJob);
    } catch (err) {
      if (err?.response?.status === 204) return [];
      console.error("❌ Job search failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Skill-matched search for authenticated candidates
  searchWithMatching: async (params = {}) => {
    try {
      const res = await apiClient.get("/api/jobposts/search/with-matching", { params });
      const data = res?.data;
      const payload = Array.isArray(data) ? data : [];
      // Backend returns objects like { jobPost: {...}, matchScore: number, matchingSkills: [] }
      return payload.map((item) => {
        if (!item) return item;
        const jobObj = item.job || item.jobPost || item.jobpost || item.post || null;
        if (jobObj) {
          return { ...item, job: normalizeJob(jobObj) };
        }
        // Fallback: item itself might be a JobPost
        return normalizeJob(item);
      });
    } catch (err) {
      if (err?.response?.status === 204) return [];
      console.error("❌ Job matching search failed:", err.response?.data || err.message);
      throw err;
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const res = await apiClient.get("/api/jobposts/filter-options");
      return res.data;
    } catch (err) {
      console.error("❌ Get filter options failed:", err.response?.data || err.message);
      throw err;
    }
  },
};