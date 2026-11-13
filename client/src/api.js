

import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://pricepilot-bu1w.onrender.com/api"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Automatically attach JWT token to every API request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

