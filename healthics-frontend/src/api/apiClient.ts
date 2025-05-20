import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Make sure this matches the backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token with every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error.response?.data || error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
      
      if (error.response.status === 401) {
        // Redirect to login if unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;