import axiosInstance from './axiosInstance';

export const createCourse = (data) => axiosInstance.post('/courses', data);
export const getAllCourses = () => axiosInstance.get('/courses');
export const getCourseById = (id) => axiosInstance.get(`/courses/${id}`);
export const updateCourse = (id, data) => axiosInstance.put(`/courses/${id}`, data);
export const deleteCourse = (id) => axiosInstance.delete(`/courses/${id}`);