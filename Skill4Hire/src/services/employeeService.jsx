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

    // Applications: Submit a candidate to a job (EMPLOYEE)
    submitCandidateApplication: async ({ candidateId, jobPostId }) => {
        if (!candidateId) throw new Error('Missing candidateId');
        if (!jobPostId) throw new Error('Missing jobPostId');
        try {
            const response = await apiClient.post('/api/employees/applications', {
                candidateId,
                jobPostId,
            });
            return response.data; // ApplicationDTO
        } catch (error) {
            // Map common backend statuses to user-friendly messages
            const status = error.response?.status;
            if (status === 404) {
                throw new Error('Job not found');
            }
            if (status === 409) {
                throw new Error('Duplicate application');
            }
            throw new Error(error.response?.data?.message || 'Failed to submit application');
        }
    }
};
