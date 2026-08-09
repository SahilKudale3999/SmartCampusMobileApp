import axiosInstance from './axiosInstance';

export const createAssignment = (data) => axiosInstance.post('/assignments', data);
export const getAllAssignments = () => axiosInstance.get('/assignments');
export const getAssignmentById = (id) => axiosInstance.get(`/assignments/${id}`);
export const updateAssignment = (id, data) => axiosInstance.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => axiosInstance.delete(`/assignments/${id}`);
export const getAssignmentsBySubject = (subjectId) => axiosInstance.get(`/assignments/subject/${subjectId}`);