import axios from 'axios';

const apiClient = axios.create({
    // In dev, use relative base URL so Vite proxy handles /api -> backend (avoids CORS with credentials)
    baseURL: import.meta.env.DEV ? '' : 'https://skill4hire-backend.onrender.com',
    withCredentials: true,           // <-- critical for session cookies
    timeout: 15000,
});

// No Authorization header on purpose (cookie-session auth)
apiClient.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Basic auth guard: if the session is invalid/forbidden, bounce to login.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            try {
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
            } catch {}
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        // Keep a useful log for debugging
        /* eslint-disable no-console */
        console.error('API Error:', error.response || error.message);
        /* eslint-enable no-console */
        return Promise.reject(error);
    }
);

export default apiClient;
