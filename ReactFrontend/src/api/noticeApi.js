import axiosClient from "./axiosClient";

const noticeApi = {
  create: (payload) => axiosClient.post("/notice", payload),
  getAll: () => axiosClient.get("/notice"),
  getById: (id) => axiosClient.get(`/notice/${id}`),
  update: (id, payload) => axiosClient.put(`/notice/${id}`, payload),
  remove: (id) => axiosClient.delete(`/notice/${id}`),
};

export default noticeApi;
