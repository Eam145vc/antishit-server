import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: 'https://anti5-0.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network error or timeout occurred');
    }
    
    return Promise.reject(error);
  }
);

// API wrapper functions
const api = {
  // Authentication
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
  
  // Monitoring endpoints
  getDevices: async (options = {}) => {
    const response = await apiClient.get('/monitoring/devices', { params: options });
    return response.data;
  },
  
  getProcesses: async (deviceId, options = {}) => {
    const response = await apiClient.get(`/monitoring/devices/${deviceId}/processes`, { params: options });
    return response.data;
  },
  
  getScreenshots: async (deviceId, options = {}) => {
    const response = await apiClient.get(`/monitoring/devices/${deviceId}/screenshots`, { params: options });
    return response.data;
  },
  
  // Forensic analysis endpoints
  getPlayerTimeline: async (playerId, options = {}) => {
    const response = await apiClient.get(`/forensics/players/${playerId}/timeline`, { params: options });
    return response.data;
  },
  
  comparePlayerActivity: async (playerIds, options = {}) => {
    const response = await apiClient.post('/forensics/compare', { playerIds, ...options });
    return response.data;
  },
  
  getPlayerBehaviorStats: async (playerId, options = {}) => {
    const response = await apiClient.get(`/forensics/players/${playerId}/behavior`, { params: options });
    return response.data;
  },
  
  // Control panel endpoints
  sendCommand: async (deviceId, command) => {
    const response = await apiClient.post(`/control/devices/${deviceId}/command`, command);
    return response.data;
  },
  
  saveNote: async (deviceId, note) => {
    const response = await apiClient.post(`/control/devices/${deviceId}/notes`, note);
    return response.data;
  },
  
  generateReport: async (playerId, options) => {
    const response = await apiClient.post(`/control/reports/players/${playerId}`, options);
    return response.data;
  },
  
  // Alerts endpoints
  getAlerts: async (options = {}) => {
    const response = await apiClient.get('/alerts', { params: options });
    return response.data;
  },
  
  updateAlertStatus: async (alertId, status) => {
    const response = await apiClient.patch(`/alerts/${alertId}`, { status });
    return response.data;
  },
  
  configureAlertSettings: async (settings) => {
    const response = await apiClient.post('/alerts/settings', settings);
    return response.data;
  }
};

export default api;