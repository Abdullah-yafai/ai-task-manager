import axios from "axios";

// const API_BASE = process.env.REACT_APP_API_URL || "https://ai-task-manager-production-6654.up.railway.app/api";
const API_BASE = process.env.REACT_APP_API_URL_LOCAL || "http://localhost:3000/api";

const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
