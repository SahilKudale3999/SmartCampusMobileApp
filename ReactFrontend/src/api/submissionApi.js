import axiosClient from "./axiosClient";

const submissionApi = {
  create: (payload) => axiosClient.post("/submissions", payload),
  getAll: () => axiosClient.get("/submissions"),
  getById: (id) => axiosClient.get(`/submissions/${id}`),
  update: (id, payload) => axiosClient.put(`/submissions/${id}`, payload),
  remove: (id) => axiosClient.delete(`/submissions/${id}`),
  getByAssignment: (assignmentId) => axiosClient.get(`/submissions/assignment/${assignmentId}`),
  getByStudent: (studentId) => axiosClient.get(`/submissions/student/${studentId}`),
  grade: (id, grade) =>
    axiosClient.patch(`/submissions/${id}/grade`, null, { params: { grade } }),
};

export default submissionApi;
