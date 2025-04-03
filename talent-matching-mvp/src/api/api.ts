import axios from 'axios';
import { LoginRequest, RegisterRequest, User } from '../types';

const API_URL = 'http://localhost:8000'; // Change this to your actual backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token to requests
api.interceptors.request.use(
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

export const authAPI = {
  register: async (data: RegisterRequest) => {
    const response = await api.post('/register', data);
    return response.data;
  },
  
  login: async (data: LoginRequest) => {
    const response = await api.post('/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

export const userAPI = {

  getUserProfile: async (): Promise<User> => {
    console.log('getting user profile');
    const response = await api.get('/user/profile');
    console.log('user profile', response.data);
    return response.data;
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/user/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api; 