import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:3000'
    : window.location.origin)
).replace(/\/$/, '').replace(/\/api$/, '') + '/api';

// Generate or retrieve persistent device ID for this device/browser
export function getDeviceId() {
  let deviceId = localStorage.getItem('app_device_id');
  if (!deviceId) {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      deviceId = 'dev_' + window.crypto.randomUUID();
    } else {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    }
    localStorage.setItem('app_device_id', deviceId);
  }
  return deviceId;
}

// Identify device name (Browser and OS)
export function getDeviceName() {
  if (typeof navigator === 'undefined') return 'Web Client';
  const ua = navigator.userAgent || '';
  let browser = 'Browser';
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/')) browser = 'Safari';

  let os = 'Device';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} on ${os}`;
}

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const deviceId = getDeviceId();
  const deviceName = getDeviceName();
  if (deviceId) {
    config.headers['X-Device-Id'] = deviceId;
  }
  if (deviceName) {
    config.headers['X-Device-Name'] = deviceName;
  }
  return config;
});

// Response interceptor to handle remote device logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const data = error.response.data;
      if (data?.code === 'DEVICE_LOGGED_OUT' || data?.error?.includes('another device')) {
        const hadToken = !!localStorage.getItem('token');
        if (hadToken) {
          localStorage.removeItem('token');
          delete apiClient.defaults.headers.common['Authorization'];
          toast.error('Session terminated: Your account was logged in from another device.', {
            id: 'device-logout-alert',
            duration: 5000
          });
          const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
          if (typeof window !== 'undefined' && !publicPaths.includes(window.location.pathname)) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 1200);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
