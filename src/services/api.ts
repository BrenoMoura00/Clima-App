import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://clima-api-dy98.onrender.com/api',
});