import api from "./axios";

export const getAllNotices = () => {
  return api.get("/notice");
};

export const getNoticeById = (id) => {
  return api.get(`/notice/${id}`);
};