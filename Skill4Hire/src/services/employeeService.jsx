import apiClient from '../utils/axiosConfig';

export const employeeService = {
    // Profile Management
    getProfile: async () => {
        try {
            const response = await apiClient.get('/api/employees/profile');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await apiClient.put('/api/employees/profile', profileData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    },

    // Profile Completeness
    getProfileCompleteness: async () => {
        try {
            const response = await apiClient.get('/api/employees/profile/completeness');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch profile completeness');
        }
    },

    // Profile Picture Upload
    uploadProfilePicture: async (file) => {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await apiClient.post('/api/employees/upload/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
        }
    },

    // Active jobs (paged)
    getActiveJobs: async (page = 0, size = 10) => {
        try {
            const response = await apiClient.get('/api/employees/jobs/active', { params: { page, size } });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch active jobs');
        }
    },

    // Search candidate profiles by skill and min years
    searchCandidates: async ({ skill, minExperience, page = 0, size = 10 } = {}) => {
        try {
            const params = {};
            if (skill) params.skill = skill;
            if (minExperience != null) params.minYears = minExperience; // backend expects minYears
            params.page = page;
            params.size = size;
            const response = await apiClient.get('/api/employees/candidates', { params });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to search candidates');
        }
    },

    // View a candidate profile
    getCandidateProfile: async (candidateId) => {
        if (!candidateId) throw new Error('Missing candidateId');
        try {
            const response = await apiClient.get(`/api/employees/candidates/${candidateId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch candidate profile');
        }
    },

    // Download candidate CV
    downloadCandidateCv: async (candidateId) => {
        if (!candidateId) throw new Error('Missing candidateId');
        try {
            const response = await apiClient.get(`/api/employees/candidates/${candidateId}/cv`, {
                responseType: 'blob'
            });
            // Try to parse filename from headers
            const dispo = response.headers?.['content-disposition'] || response.headers?.get?.('content-disposition');
            let filename = 'resume.pdf';
            if (dispo) {
                const match = /filename\*=UTF-8''([^;]+)|filename="?([^;"]+)"?/i.exec(dispo);
                filename = decodeURIComponent(match?.[1] || match?.[2] || filename);
            }
            return { blob: response.data, filename };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to download candidate CV');
        }
    },

    // Recommend candidate to job
    recommendCandidate: async ({ candidateId, jobId, note }) => {
        if (!candidateId || !jobId) throw new Error('Missing candidateId or jobId');
        try {
            const payload = { candidateId, jobId, note };
            const response = await apiClient.post('/api/employees/recommendations', payload);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit recommendation');
        }
    },

    // View my recommendations (paged)
    getMyRecommendations: async (page = 0, size = 10) => {
        try {
            const response = await apiClient.get('/api/employees/recommendations', { params: { page, size } });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
        }
    },

    // View recommendations for a specific job
    getJobRecommendations: async (jobId, page = 0, size = 10) => {
        if (!jobId) throw new Error('Missing jobId');
        try {
            const response = await apiClient.get(`/api/employees/jobs/${jobId}/recommendations`, { params: { page, size } });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch job recommendations');
        }
    },

    // Optional metrics (safe fallback)
    getDashboardMetrics: async () => {
        try {
            const response = await apiClient.get('/api/employees/metrics');
            return response.data;
        } catch {
            // fallback
            return { totalCandidates: 0, activeJobs: 0, upcomingInterviews: 0, newApplications: 0 };
        }
    }
};