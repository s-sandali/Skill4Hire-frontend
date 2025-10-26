import axios from 'axios';

const apiClient = axios.create({
  // ✅ For dev mode — use direct backend URL
  baseURL: import.meta.env.DEV ? 'http://localhost:8080' : 'https://skill4hire-backend.onrender.com',
  withCredentials: true, // keep this for session cookies
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
