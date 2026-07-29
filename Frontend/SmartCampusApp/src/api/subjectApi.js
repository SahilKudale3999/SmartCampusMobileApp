import api from "./axios";

export const getAllSubjects = () => {
  return api.get("/subject");
};

export const getSubjectsByCourse = (courseId) => {
  return api.get(`/subject/course/${courseId}`);
};

export const getSubjectById = (id) => {
  return api.get(`/subject/${id}`);
};