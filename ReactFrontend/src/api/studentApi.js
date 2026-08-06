import axiosClient from "./axiosClient";

const studentApi = {
  create: (payload) => axiosClient.post("/students", payload),
  getAll: () => axiosClient.get("/students"),
  getById: (id) => axiosClient.get(`/students/${id}`),
  update: (id, payload) => axiosClient.put(`/students/${id}`, payload),
  remove: (id) => axiosClient.delete(`/students/${id}`),
  getByCourse: (courseId) => axiosClient.get(`/students/course/${courseId}`),
  getByRollNo: (rollNo) => axiosClient.get(`/students/roll/${rollNo}`),
};

export default studentApi;
