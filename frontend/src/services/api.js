import axios from "axios";

const getApiUrl = () => {
  let base;
  if (
    import.meta.env.VITE_API_URL &&
    !import.meta.env.VITE_API_URL.includes("localhost")
  ) {
    base = import.meta.env.VITE_API_URL;
  } else if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    base = "https://opentrace-server.onrender.com/api";
  } else {
    base = "http://localhost:5000/api";
  }

  // Normalize: strip trailing slash, ensure it ends in /api
  base = base.replace(/\/+$/, "");
  if (!base.endsWith("/api")) base += "/api";

  return base;
};

export const API_URL = getApiUrl();
console.log("[OpenTrace] Resolved API base URL:", API_URL);







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
