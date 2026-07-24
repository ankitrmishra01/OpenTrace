import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("ot_token");
      localStorage.removeItem("ot_user");
    }
    return Promise.reject(error);
  },
);


export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  googleAuth: (data) => api.post("/auth/google", data),
  getUser: () => api.get("/auth/user"),
};

export const scanAPI = {
  startScan: (username, options = {}) => api.post("/scan/start", { username, ...options }),
  getHistory: () => api.get("/scan/history"),
  getScanResult: (scanId) => api.get(`/scan/${scanId}`),
  generateAnalysis: (scanId) => api.post("/scan/analyze", { scanId }),
  checkEmailBreaches: () => api.get("/scan/account-security/email"),
  checkPasswordLeak: (password) => api.post("/scan/account-security/password", { password }),
};


export default api;
