import axios from "axios";
const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "/api", headers: { "Content-Type": "application/json" } });
http.interceptors.request.use((config) => { try { const session = JSON.parse(localStorage.getItem("smart-campus-session")); if (session?.token) config.headers.Authorization = `Bearer ${session.token}`; } catch { /* unauthenticated */ } return config; });
http.interceptors.response.use((response) => response.data?.data ?? response.data, (error) => Promise.reject({ message: error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong", fieldErrors: error.response?.data?.fieldErrors, status: error.response?.status }));
export default http;
