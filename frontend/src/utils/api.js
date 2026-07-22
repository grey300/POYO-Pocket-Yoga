import axios from 'axios';

// Central API base URL for all backend requests.
// Configure via frontend/.env -> REACT_APP_API_BASE
export const API_BASE =
    process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export const TOKEN_KEY = 'poyo_token';

// Shared axios instance that automatically attaches the auth token.
const apiClient = axios.create({ baseURL: API_BASE });

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401 (expired/invalid token), clear the stored session.
apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('poyo_user');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
