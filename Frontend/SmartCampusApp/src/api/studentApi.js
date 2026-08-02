import api from "./axios";

export const createStudent = (request) => {
  return api.post("/students", request);
};

// Everything below was missing -- backend already supports all of these.

export const getAllStudents = () => {
  return api.get("/students");
};

export const getStudentById = (id) => {
  return api.get(`/students/${id}`);
};

export const updateStudent = (id, request) => {
  return api.put(`/students/${id}`, request);
};

export const deleteStudent = (id) => {
  return api.delete(`/students/${id}`);
};

// Needed for rosters: subject -> subject.courseId -> this call
export const getStudentsByCourse = (courseId) => {
  return api.get(`/students/course/${courseId}`);
};

export const getStudentByRollNo = (rollNo) => {
  return api.get(`/students/roll/${rollNo}`);
};