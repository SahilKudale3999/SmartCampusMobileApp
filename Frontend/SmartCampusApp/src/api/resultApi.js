import api from "./axios";


export const getStudentResults = (studentId) => {
  return api.get(`/submissions/student/${studentId}`);
};

export const getAssignmentsBySubject = (subjectId) => {
  return api.get(`/assignments/subject/${subjectId}`);
};

export const getAllAssignments = () => {
  return api.get("/assignments");
};

export const getAssignmentById = (id) => {
  return api.get(`/assignments/${id}`);
};