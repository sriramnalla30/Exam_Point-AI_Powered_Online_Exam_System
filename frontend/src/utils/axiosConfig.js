import axios from 'axios';

const API_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false // Disable sending credentials for now since we're using permitAll
});



// Request interceptor for API calls
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error handling
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful responses for debugging
        console.log('API Response:', response.data);
        return response;
    },
    (error) => {
        console.error('API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return Promise.reject(error);
    }
);

export default axiosInstance; 