import axios from 'axios';
import { toast } from 'react-toastify';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem('auth'));

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function apiRequest(promise) {
  try {
    return await promise;
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'Request failed';

    toast.error(msg);
    throw err;
  }
}