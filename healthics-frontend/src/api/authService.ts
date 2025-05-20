import apiClient from './apiClient';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string[]; // Changed back to role to match backend's expected field
}

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  tokenType: string; // Changed from type to tokenType to match backend
  id: number;
  username: string;
  email: string;
  roles: string[];
}

const authService = {
  register: async (data: RegisterRequest) => {
    // Make sure this endpoint matches the one in AuthController.java
    const response = await apiClient.post<any>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    // Added /signin to the endpoint path to match backend
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    // Check for 'ROLE_ADMIN' in the roles array
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  },
};

export default authService;