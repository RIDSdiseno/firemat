import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Este "interceptor" pega el token automáticamente en cada llamada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // O donde guardes tu JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;