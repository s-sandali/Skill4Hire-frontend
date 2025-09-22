import apiClient from '../utils/axiosConfig';

// Service for candidate job applications
export const applicationsService = {
  // Fetch applications for a candidate by their ID
  getByCandidate: async (candidateId) => {
    if (!candidateId) throw new Error('Missing candidateId');

    // Preferred RESTful route; adjust if your backend differs
    const url = `/candidates/${candidateId}/applications`;
    const { data } = await apiClient.get(url);
    return data;
  },
};

export default applicationsService;

