import axiosInstance from './axiosInstance';

export const getAllAttendance = () => axiosInstance.get('/attendance');
export const getAttendanceById = (id) => axiosInstance.get(`/attendance/${id}`);
export const createAttendance = (data) => axiosInstance.post('/attendance', data);
export const updateAttendance = (id, data) => axiosInstance.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => axiosInstance.delete(`/attendance/${id}`);
export const getAttendanceBySubject = (subjectId) =>
  axiosInstance.get(`/attendance/subject/${subjectId}`);
export const getAttendanceByStudent = (studentId) =>
  axiosInstance.get(`/attendance/student/${studentId}`);