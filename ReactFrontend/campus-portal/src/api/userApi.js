import axiosInstance from './axiosInstance';

export const createUser = (data) => axiosInstance.post('/users', data);
export const getAllUsers = () => axiosInstance.get('/users');
export const getUserById = (id) => axiosInstance.get(`/users/${id}`);
export const updateUser = (id, data) => axiosInstance.put(`/users/${id}`, data);
export const deleteUser = (id) => axiosInstance.delete(`/users/${id}`);
export const activateUser = (id) => axiosInstance.patch(`/users/${id}/activate`);
export const deactivateUser = (id) => axiosInstance.patch(`/users/${id}/deactivate`);