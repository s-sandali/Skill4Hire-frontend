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

    // Search candidate basics by skill and minExperience (paged)
    searchCandidates: async ({ skill, minExperience, page = 0, size = 10 } = {}) => {
        try {
            const params = {};
            if (skill) params.skill = skill;
            if (minExperience != null) params.minExperience = minExperience; // backend expects minExperience
            params.page = page;
            params.size = size;
            const response = await apiClient.get('/api/employees/candidates/basic', { params });
            return response.data; // Page<CandidateBasicView>
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to search candidates');
        }
    },

    // View a candidate profile enriched with basic info (CV metadata, avatar paths)
    getCandidateProfile: async (candidateId) => {
        if (!candidateId) throw new Error('Missing candidateId');
        try {
            const [basicResponse, profileResponse] = await Promise.all([
                apiClient.get(`/api/employees/candidates/${candidateId}/basic`),
                apiClient.get(`/api/employees/candidates/${candidateId}`)
            ]);

            const basic = basicResponse?.data || {};
            const profile = profileResponse?.data || {};

            const resumePath = profile.resumePath || basic.resumePath || '';
            const profilePicturePath = profile.profilePicturePath || basic.profilePicturePath || '';

            const normalized = {
                ...basic,
                ...profile,
                candidateId: profile.userId || basic.candidateId || candidateId,
                name: profile.name || basic.name,
                title: profile.title || basic.title,
                location: profile.location || basic.location,
                email: profile.email || basic.email,
                phoneNumber: profile.phoneNumber || profile.phone || basic.phoneNumber || basic.phone,
                skills: Array.isArray(profile.skills) && profile.skills.length > 0
                    ? profile.skills
                    : (Array.isArray(basic.skills) ? basic.skills : []),
                resumePath,
                profilePicturePath
            };

            const hasCv = basic.hasCv ?? Boolean(resumePath);
            normalized.hasCv = hasCv;

            const cvDownloadUrl = basic.cvDownloadUrl || (hasCv ? `/api/employees/candidates/${candidateId}/cv` : '');
            if (cvDownloadUrl) {
                normalized.cvDownloadUrl = cvDownloadUrl;
            }

            if (profilePicturePath && !normalized.profilePictureUrl) {
                normalized.profilePictureUrl = `/uploads/profile-pictures/${profilePicturePath}`;
            }

            if (!normalized.resumeFileName && resumePath) {
                const parts = String(resumePath).split(/[/\\]/);
                normalized.resumeFileName = parts[parts.length - 1];
            }

            return normalized;
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
            const data = response.data;
            // Normalize to array of RecommendationView where possible
            const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
            return { ...data, content };
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
    },

    // Notifications for employees (parity with company/candidate services)
    getNotifications: async () => {
        try {
            const { data } = await apiClient.get('/api/employees/notifications');
            if (import.meta.env?.DEV) {
                console.log('[employeeService] GET /api/employees/notifications ->', data);
            }
            return data;
        } catch (error) {
            if (import.meta.env?.DEV) console.error('[employeeService] notifications error', error?.response || error);
            throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
        }
    },

    getUnreadNotificationCount: async () => {
        try {
            const { data } = await apiClient.get('/api/employees/notifications/count');
            return data; // expect { unreadCount }
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch unread notification count');
        }
    },

    markNotificationAsRead: async (notificationId) => {
        if (!notificationId) throw new Error('Missing notificationId');
        try {
            await apiClient.put(`/api/employees/notifications/${notificationId}/read`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
        }
    },

    markAllNotificationsAsRead: async () => {
        try {
            await apiClient.put('/api/employees/notifications/read-all');
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
        }
    },

    deleteNotification: async (notificationId) => {
        if (!notificationId) throw new Error('Missing notificationId');
        try {
            await apiClient.delete(`/api/employees/notifications/${notificationId}`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete notification');
        }
    },

    // New functions for pagination and PATCH support
    getEmployeeNotifications: async (page, limit) => {
        try {
            if (typeof page === 'number' && typeof limit === 'number') {
                const { data } = await apiClient.get('/api/employees/notifications', { params: { page, limit } });
                if (import.meta.env?.DEV) console.log('[employeeService] paged notifications', { page, limit, data });
                return data; // { content, page, limit, totalElements, totalPages }
            }
            const { data } = await apiClient.get('/api/employees/notifications');
            if (import.meta.env?.DEV) console.log('[employeeService] notifications array', data);
            return data; // array fallback
        } catch (err) {
            if (import.meta.env?.DEV) console.error('[employeeService] getEmployeeNotifications error', err?.response || err);
            throw new Error(err.response?.data?.message || 'Failed to fetch notifications');
        }
    },

    patchMarkNotificationAsRead: async (notificationId) => {
        if (!notificationId) throw new Error('Missing notificationId');
        try {
            await apiClient.patch(`/api/employees/notifications/${notificationId}/read`);
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to mark notification as read');
        }
    },

    // Dev-only helper to seed a sample notification for current employee
    seedOneNotification: async () => {
        try {
            const { data } = await apiClient.post('/api/employees/notifications/seed');
            return data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to seed notification');
        }
    }
};