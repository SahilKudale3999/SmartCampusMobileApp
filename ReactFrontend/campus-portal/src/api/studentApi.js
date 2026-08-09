import axiosInstance from './axiosInstance';

export const createStudent = (data) => axiosInstance.post('/students', data);
export const getAllStudents = () => axiosInstance.get('/students');
export const getStudentById = (id) => axiosInstance.get(`/students/${id}`);
export const updateStudent = (id, data) => axiosInstance.put(`/students/${id}`, data);
export const deleteStudent = (id) => axiosInstance.delete(`/students/${id}`);
export const getStudentsByCourse = (courseId) => axiosInstance.get(`/students/course/${courseId}`);
export const getStudentByRollNo = (rollNo) => axiosInstance.get(`/students/roll/${rollNo}`);
