import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token (if present) to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic response passthrough / error normalization
axiosClient.interceptors.response.use(
  (response) => response.data, // backend wraps everything in { success, message, data }
  (error) => {
    const apiBody = error?.response?.data; // { success, message, data } — data holds field errors on 400
    const message = apiBody?.message || error?.message || "Something went wrong";
    const fieldErrors = apiBody && typeof apiBody.data === "object" ? apiBody.data : null;
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ message, fieldErrors, status, raw: error });
  }
);

export default axiosClient;
