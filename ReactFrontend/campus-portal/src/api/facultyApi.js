import axiosInstance from './axiosInstance';

export const createFaculty = (data) => axiosInstance.post('/faculty', data);
export const getAllFaculty = () => axiosInstance.get('/faculty');
export const getFacultyById = (id) => axiosInstance.get(`/faculty/${id}`);
export const updateFaculty = (id, data) => axiosInstance.put(`/faculty/${id}`, data);
export const deleteFaculty = (id) => axiosInstance.delete(`/faculty/${id}`);