import api from "./axios";

export const getAllNotices = () => {
  return api.get("/notice");
};

export const getNoticeById = (id) => {
  return api.get(`/notice/${id}`);
};

export const createNotice = (noticeData) => {
  // noticeData: { title, description, createdBy }
  return api.post("/notice", noticeData);
};

export const updateNotice = (id, noticeData) => {
  return api.put(`/notice/${id}`, noticeData);
};

export const deleteNotice = (id) => {
  return api.delete(`/notice/${id}`);
};