import axiosClient from "./axiosClient";

const courseApi = {
  create: (payload) => axiosClient.post("/courses", payload),
  getAll: () => axiosClient.get("/courses"),
  getById: (id) => axiosClient.get(`/courses/${id}`),
  update: (id, payload) => axiosClient.put(`/courses/${id}`, payload),
  remove: (id) => axiosClient.delete(`/courses/${id}`),
};

export default courseApi;
