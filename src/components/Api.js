import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nodeserver-priyanshuc123-priyanshuc123s-projects.vercel.app/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;