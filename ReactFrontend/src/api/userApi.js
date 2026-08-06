import axiosClient from "./axiosClient";

const userApi = {
  create: (payload) => axiosClient.post("/users", payload),
  getAll: () => axiosClient.get("/users"),
  getById: (id) => axiosClient.get(`/users/${id}`),
  update: (id, payload) => axiosClient.put(`/users/${id}`, payload),
  remove: (id) => axiosClient.delete(`/users/${id}`),
  activate: (id) => axiosClient.patch(`/users/${id}/activate`),
  deactivate: (id) => axiosClient.patch(`/users/${id}/deactivate`),
};

export default userApi;
