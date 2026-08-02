import api from "./axios";

// Fetch full attendance history for a specific student
export const getAttendanceByStudent = (studentId) => {
  return api.get(`/attendance/student/${studentId}`);
};

// Fetch calculated percentage (by student & subject)
export const getAttendancePercentage = (studentId, subjectId) => {
  return api.get("/attendance/percentage", {
    params: { studentId, subjectId },
  });
};

// Fetch attendance for a specific date
export const getAttendanceByDate = (date) => {
  return api.get(`/attendance/date/${date}`);
};

// Everything below was missing -- backend already supports all of these.

// Mark one attendance record. No bulk endpoint exists -- call this once
// per student when submitting a whole class.
export const createAttendance = (request) => {
  return api.post("/attendance", request);
};

export const updateAttendance = (id, request) => {
  return api.put(`/attendance/${id}`, request);
};

export const deleteAttendance = (id) => {
  return api.delete(`/attendance/${id}`);
};

export const getAttendanceById = (id) => {
  return api.get(`/attendance/${id}`);
};

export const getAttendanceBySubject = (subjectId) => {
  return api.get(`/attendance/subject/${subjectId}`);
};