export const candidateService = {
  async getCandidateProfile() {
    const response = await fetch('/api/candidates/me');
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async updateProfile(data) {
    const response = await fetch('/api/candidates/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }
};