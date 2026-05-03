import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://897b-2401-4900-1c84-3204-6511-398-c1a0-b24f.ngrok-free.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Skip ngrok browser warning for free ngrok URLs
    'ngrok-skip-browser-warning': 'true',
  },
});

export default apiClient;
export { API_BASE_URL };

// Made with Bob
