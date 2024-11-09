import axios from 'axios';

const detectAPI = axios.create({
  baseURL: import.meta.env.VITE_DETECT_API, // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default detectAPI;