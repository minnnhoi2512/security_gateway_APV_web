import axios from "axios";
import baseAPI from './baseAPI'

export const axiosClient = axios.create({
  baseURL: baseAPI,
  headers: {
    'Content-Type': 'application/json',
  },
});
