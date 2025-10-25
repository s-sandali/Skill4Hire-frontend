import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.DEV
    ? ''
    : import.meta.env.VITE_API_BASE_URL || 'https://skill4hire-backend.onrender.com',
  withCredentials: true,
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
