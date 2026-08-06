import http from "../../../lib/http";
export const login = (credentials) => http.post("/auth/login", credentials);
