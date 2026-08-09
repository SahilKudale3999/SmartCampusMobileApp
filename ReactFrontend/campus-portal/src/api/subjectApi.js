import axiosInstance from './axiosInstance';

export const createSubject = (data) => axiosInstance.post('/subject', data);
export const getAllSubjects = () => axiosInstance.get('/subject');
export const getSubjectById = (id) => axiosInstance.get(`/subject/${id}`);
export const updateSubject = (id, data) => axiosInstance.put(`/subject/${id}`, data);
export const deleteSubject = (id) => axiosInstance.delete(`/subject/${id}`);
export const getSubjectsByCourse = (courseId) => axiosInstance.get(`/subject/course/${courseId}`);
export const getSubjectsByFaculty = (facultyId) => axiosInstance.get(`/subject/faculty/${facultyId}`);