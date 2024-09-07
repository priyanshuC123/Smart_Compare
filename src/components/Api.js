import axios from 'axios';

const api = axios.create({
  baseURL: 'https://services-rouge-eight.vercel.app/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
