import axios from 'axios';
import { LoginRequest, RegisterRequest, User, Job, CandidateMatch } from '../types';

const API_URL = 'http://localhost:8000'; // Change this to your actual backend URL

const api = axios.create({
  baseURL: API_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
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
    const { username, ...rest } = data;
    const requestData = {
      ...rest,
      email: username
    };
    const response = await api.post('/register', requestData);
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
    // console.log('getting user profile');
    const response = await api.get('/user/profile');
    // console.log('user profile', response.data);
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

export const businessAPI = {
  createJob: async (jobDesc: string, jobTitle: string): Promise<Job> => {
    console.log("creating job", jobDesc, jobTitle);
    const response = await api.post('/business/create_job', { job_desc: jobDesc, job_title: jobTitle });
    return response.data;
  },

  getJobs: async (): Promise<Job[]> => {
    const response = await api.get('/business/get_jobs');
    return response.data;
  },

  editJob: async (
    jobId: string, 
    jobTitle?: string, 
    jobDesc?: string, 
    ratingSchema?: string, 
    ratingSchemaWeights?: string
  ): Promise<Job> => {
    const response = await api.post('/business/edit_job', {
      job_id: jobId,
      job_title: jobTitle,
      job_desc: jobDesc,
      rating_schema: ratingSchema,
      rating_schema_weights: ratingSchemaWeights,
    });
    return response.data;
  },

  getResumeMatches: async (jobId: string): Promise<CandidateMatch[]> => {
    const response = await api.get(`/business/get_resume_matches?job_id=${jobId}`);
    return response.data;
  },

  calculateMatches: async (jobId: string): Promise<CandidateMatch[]> => {
    const response = await api.get(`/business/calculate_matches?job_id=${jobId}`);
    return response.data;
  },

  getMatches: async (jobId: string): Promise<CandidateMatch[]> => {
    const response = await api.get(`/business/get_matches?job_id=${jobId}`);
    return response.data;
  },
};

export default api; 