import axiosClient from "./axiosClient";

const assignmentApi = {
  create: (payload) => axiosClient.post("/assignments", payload),
  getAll: () => axiosClient.get("/assignments"),
  getById: (id) => axiosClient.get(`/assignments/${id}`),
  update: (id, payload) => axiosClient.put(`/assignments/${id}`, payload),
  remove: (id) => axiosClient.delete(`/assignments/${id}`),
  getBySubject: (subjectId) => axiosClient.get(`/assignments/subject/${subjectId}`),
};

export default assignmentApi;
