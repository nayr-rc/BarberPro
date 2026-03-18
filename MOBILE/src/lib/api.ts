import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://barberpro-api-v4kj.onrender.com/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};
