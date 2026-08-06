import api from "./axios";

export const getAssignmentsBySubject = (subjectId) => {
  return api.get(`/assignments/subject/${subjectId}`);
};

export const getAllAssignments = () => {
  return api.get("/assignments");
};

export const getAssignmentById = (id) => {
  return api.get(`/assignments/${id}`);
};

// Everything below was missing -- backend already supports all of these.

export const createAssignment = (request) => {
  return api.post("/assignments", request);
};

export const updateAssignment = (id, request) => {
  return api.put(`/assignments/${id}`, request);
};

export const deleteAssignment = (id) => {
  return api.delete(`/assignments/${id}`);
};