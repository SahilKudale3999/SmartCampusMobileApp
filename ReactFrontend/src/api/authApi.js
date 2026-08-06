import axiosClient from "./axiosClient";

const authApi = {
  login: (payload) => axiosClient.post("/auth/login", payload), // { email, password }
  register: (payload) => axiosClient.post("/auth/register", payload), // UserRequest
};

export default authApi;
