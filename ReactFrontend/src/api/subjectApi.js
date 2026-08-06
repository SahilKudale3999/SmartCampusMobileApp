import axiosClient from "./axiosClient";

const subjectApi = {
  create: (payload) => axiosClient.post("/subject", payload),
  getAll: () => axiosClient.get("/subject"),
  getById: (id) => axiosClient.get(`/subject/${id}`),
  update: (id, payload) => axiosClient.put(`/subject/${id}`, payload),
  remove: (id) => axiosClient.delete(`/subject/${id}`),
  getByCourse: (courseId) => axiosClient.get(`/subject/course/${courseId}`),
  getByFaculty: (facultyId) => axiosClient.get(`/subject/faculty/${facultyId}`),
};

export default subjectApi;
