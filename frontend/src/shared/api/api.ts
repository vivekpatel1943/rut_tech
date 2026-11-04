import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor (Ready for Bearer token when auth is introduced) ──
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: centralized error normalization ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";
    console.error("[API Error]:", message);
    return Promise.reject(error);
  }
);

export default api;

