import apiClient from '../utils/axiosConfig';

// Allowed status values as per backend: APPLIED, SHORTLISTED, REJECTED
const VALID_STATUSES = new Set(['APPLIED', 'SHORTLISTED', 'REJECTED']);

// Service for candidate job applications
export const applicationsService = {
  // Session-scoped (logged-in candidate via cookie)
  listForCurrent: async () => {
    const { data } = await apiClient.get('/api/candidates/applications');
    return data;
  },

  listForCurrentByStatus: async (status) => {
    if (!status) throw new Error('Missing status');
    const s = String(status).toUpperCase();
    if (!VALID_STATUSES.has(s)) throw new Error('Invalid status');
    const { data } = await apiClient.get(`/api/candidates/applications/status/${s}`);
    return data;
  },

  summaryForCurrent: async () => {
    const { data } = await apiClient.get('/api/candidates/applications/summary');
    return data; // { applied, shortlisted, rejected }
  },

  listAllForCurrent: async () => {
    const { data } = await apiClient.get('/api/candidates/applications/all');
    return data;
  },

  // By explicit candidateId
  listByCandidateId: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidateId');
    const { data } = await apiClient.get(`/api/candidates/${encodeURIComponent(candidateId)}/applications`);
    return data;
  },

  listByCandidateIdAndStatus: async (candidateId, status) => {
    if (!candidateId) throw new Error('Missing candidateId');
    if (!status) throw new Error('Missing status');
    const s = String(status).toUpperCase();
    if (!VALID_STATUSES.has(s)) throw new Error('Invalid status');
    const { data } = await apiClient.get(`/api/candidates/${encodeURIComponent(candidateId)}/applications/status/${s}`);
    return data;
  },

  summaryByCandidateId: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidateId');
    const { data } = await apiClient.get(`/api/candidates/${encodeURIComponent(candidateId)}/applications/summary`);
    return data; // { applied, shortlisted, rejected }
  },

  // Companies view (grouped by status)
  companiesByStatus: async (candidateId, status) => {
    if (!candidateId) throw new Error('Missing candidateId');
    if (!status) throw new Error('Missing status');
    const s = String(status).toUpperCase();
    if (!VALID_STATUSES.has(s)) throw new Error('Invalid status');
    const { data } = await apiClient.get(`/api/candidates/${encodeURIComponent(candidateId)}/applications/companies`, {
      params: { status: s },
    });
    return data;
  },

  companiesApplied: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidateId');
    const { data } = await apiClient.get(`/api/candidates/${encodeURIComponent(candidateId)}/applications/companies/applied`);
    return data;
  },

  companiesShortlisted: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidateId');
    const { data } = await apiClient.get(`/api/candidates/${encodeURIComponent(candidateId)}/applications/companies/shortlisted`);
    return data;
  },

  companiesRejected: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidateId');
    const { data } = await apiClient.get(`/api/candidates/${encodeURIComponent(candidateId)}/applications/companies/rejected`);
    return data;
  },
};

export default applicationsService;
