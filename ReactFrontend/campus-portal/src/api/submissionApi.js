import axiosInstance from './axiosInstance';

export const getAllSubmissions = () => axiosInstance.get('/submissions');
export const getSubmissionById = (id) => axiosInstance.get(`/submissions/${id}`);
export const updateSubmission = (id, data) => axiosInstance.put(`/submissions/${id}`, data);
export const deleteSubmission = (id) => axiosInstance.delete(`/submissions/${id}`);
export const getSubmissionsByAssignment = (assignmentId) =>
  axiosInstance.get(`/submissions/assignment/${assignmentId}`);
export const getSubmissionsByStudent = (studentId) =>
  axiosInstance.get(`/submissions/student/${studentId}`);
export const gradeSubmission = (id, grade) =>
  axiosInstance.patch(`/submissions/${id}/grade`, null, { params: { grade } });