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

// Was missing -- backend already exposes GET /subject/faculty/{facultyId}
export const getSubjectsByFaculty = (facultyId) => {
  return api.get(`/subject/faculty/${facultyId}`);
};

export const createSubject = (payload) => {
  return api.post("/subject", payload);
};