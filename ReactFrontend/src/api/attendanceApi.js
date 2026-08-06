import axiosClient from "./axiosClient";

const attendanceApi = {
  create: (payload) => axiosClient.post("/attendance", payload),
  update: (id, payload) => axiosClient.put(`/attendance/${id}`, payload),
  remove: (id) => axiosClient.delete(`/attendance/${id}`),
  getById: (id) => axiosClient.get(`/attendance/${id}`),
  getByStudent: (studentId) => axiosClient.get(`/attendance/student/${studentId}`),
  getBySubject: (subjectId) => axiosClient.get(`/attendance/subject/${subjectId}`),
  getByDate: (date) => axiosClient.get(`/attendance/date/${date}`), // date: 'YYYY-MM-DD'
  getPercentage: (studentId, subjectId) =>
    axiosClient.get("/attendance/percentage", { params: { studentId, subjectId } }),
};

export default attendanceApi;
