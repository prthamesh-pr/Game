import axios from 'axios';

const api = axios.create({
  baseURL: 'https://game-39rz.onrender.com/api',
  withCredentials: true,
});

export default api;
