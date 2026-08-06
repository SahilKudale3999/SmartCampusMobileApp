import axiosClient from "./axiosClient";

const facultyApi = {
  create: (payload) => axiosClient.post("/faculty", payload),
  getAll: () => axiosClient.get("/faculty"),
  getById: (id) => axiosClient.get(`/faculty/${id}`),
  update: (id, payload) => axiosClient.put(`/faculty/${id}`, payload),
  remove: (id) => axiosClient.delete(`/faculty/${id}`),
  getByDepartment: (department) => axiosClient.get(`/faculty/department/${department}`),
};

export default facultyApi;
