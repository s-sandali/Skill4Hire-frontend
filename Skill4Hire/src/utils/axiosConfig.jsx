import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:8080'  // local dev backend
    : 'https://skill4hire-backend.onrender.com',  // deployed backend
  withCredentials: true, // required for session authentication
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
      } catch {}
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
