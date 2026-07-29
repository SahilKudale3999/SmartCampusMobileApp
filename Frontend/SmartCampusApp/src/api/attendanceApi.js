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