import axiosClient from "./axiosClient";

const eventApi = {
  create: (payload) => axiosClient.post("/event", payload),
  getAll: () => axiosClient.get("/event"),
  getUpcoming: () => axiosClient.get("/event/upcoming"),
  getById: (id) => axiosClient.get(`/event/${id}`),
  update: (id, payload) => axiosClient.put(`/event/${id}`, payload),
  remove: (id) => axiosClient.delete(`/event/${id}`),
};

export default eventApi;
