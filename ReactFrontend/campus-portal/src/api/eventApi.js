import axiosInstance from './axiosInstance';

export const createEvent = (data) => axiosInstance.post('/event', data);
export const getAllEvents = () => axiosInstance.get('/event');
export const getUpcomingEvents = () => axiosInstance.get('/event/upcoming');
export const getEventById = (id) => axiosInstance.get(`/event/${id}`);
export const updateEvent = (id, data) => axiosInstance.put(`/event/${id}`, data);
export const deleteEvent = (id) => axiosInstance.delete(`/event/${id}`);