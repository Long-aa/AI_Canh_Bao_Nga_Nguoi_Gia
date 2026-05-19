import axios from 'axios';

const API_BASE_URL = 'https://unmade-backed-willed.ngrok-free.dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // Tăng lên 20s
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    'ngrok-skip-browser-warning': 'true', // Bỏ qua trang cảnh báo của Ngrok
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const getStats = async () => {
  try {
    const response = await api.get('/api/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const getAlerts = async (limit = 100, alertType = null) => {
  try {
    const params = new URLSearchParams({ limit });
    if (alertType) params.append('alert_type', alertType);
    const response = await api.get(`/api/alerts?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const getFallClips = async (limit = 50) => {
  try {
    const response = await api.get(`/api/alerts/fall-clips?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fall clips:', error);
    throw error;
  }
};

export const resolveAlert = async (alertId) => {
  try {
    const response = await api.patch(`/api/alerts/${alertId}/resolve`);
    return response.data;
  } catch (error) {
    console.error('Error resolving alert:', error);
    throw error;
  }
};

export const markFalseAlarm = async (alertId) => {
  try {
    const response = await api.patch(`/api/alerts/${alertId}/false-alarm`);
    return response.data;
  } catch (error) {
    console.error('Error marking false alarm:', error);
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

export const getDevices = async () => {
  try {
    const response = await api.get('/api/devices');
    return response.data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

export const getStorageCredentials = async () => {
  try {
    const response = await api.get('/api/storage/credentials');
    return response.data;
  } catch (error) {
    console.error('Error fetching storage credentials:', error);
    throw error;
  }
};

export const createDevice = async (deviceData) => {
  try {
    const response = await api.post('/api/devices', deviceData);
    return response.data;
  } catch (error) {
    console.error('Error creating device:', error);
    throw error;
  }
};

export const uploadDeviceVideo = async (formData) => {
  try {
    const baseURL = api.defaults.baseURL;
    const response = await fetch(`${baseURL}/api/devices/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'bypass-tunnel-reminder': 'true'
      }
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Upload failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error uploading device video:', error);
    throw error;
  }
};


export const updateDevice = async (id, deviceData) => {
  try {
    const response = await api.put(`/api/devices/${id}`, deviceData);
    return response.data;
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};

export const deleteDevice = async (id) => {
  try {
    const response = await api.delete(`/api/devices/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting device:', error);
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
    const baseURL = api.defaults.baseURL;
    const response = await fetch(`${baseURL}/api/elderly-profiles`, {
      method: 'POST',
      body: profileData,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'bypass-tunnel-reminder': 'true'
      }
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Profile creation failed with status ${response.status}`);
    }
    return await response.json();
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
export const getMobileSession = async () => {
  try {
    const response = await api.get('/api/mobile/session');
    return response.data;
  } catch (error) {
    console.error('Error creating mobile session:', error);
    throw error;
  }
};

export const getMobileStatus = async (sessionId) => {
  try {
    const response = await api.get(`/api/mobile/status/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking mobile status:', error);
    throw error;
  }
};
