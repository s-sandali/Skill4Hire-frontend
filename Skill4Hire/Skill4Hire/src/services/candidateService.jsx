// ...existing code...
  applyToJob: async (jobId) => {
    try {
      if (!jobId) {
        throw new Error('Missing job identifier');
      }

      const payload = { jobPostId: jobId };
      const response = await apiClient.post('/api/candidates/applications', payload);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 409) {
        throw new Error('You have already applied to this job.');
      }
      if (status === 404) {
        throw new Error('Job not found or no longer available.');
      }
      throw new Error(error.response?.data?.message || 'Failed to apply to job');
    }
  },
// ...existing code...
