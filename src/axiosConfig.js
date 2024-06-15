import axios from 'axios';

const api = axios.create({
  baseURL: 'https://app-finan-back.onrender.com', // Base URL do seu backend
  headers: {
    'Content-Type': 'application/json',
  },
});
export default api;
