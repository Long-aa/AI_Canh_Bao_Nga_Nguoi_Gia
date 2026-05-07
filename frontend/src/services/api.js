import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const getAlerts = async (limit = 100) => {
  try {
    const response = await api.get(`/api/alerts?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const getElderlyProfiles = async () => {
  try {
    const response = await api.get('/api/elderly-profiles');
    return response.data;
  } catch (error) {
    console.error('Error fetching elderly profiles:', error);
    throw error;
  }
};

export const createAlert = async (alertData) => {
  try {
    const response = await api.post('/api/alerts', alertData);
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const createElderlyProfile = async (profileData) => {
  try {
    const response = await api.post('/api/elderly-profiles', profileData);
    return response.data;
  } catch (error) {
    console.error('Error creating elderly profile:', error);
    throw error;
  }
};

export const updateElderlyProfile = async (id, profileData) => {
  try {
    const response = await api.put(`/api/elderly-profiles/${id}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating elderly profile:', error);
    throw error;
  }
};

export const deleteElderlyProfile = async (id) => {
  try {
    const response = await api.delete(`/api/elderly-profiles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting elderly profile:', error);
    throw error;
  }
};

export default api;
