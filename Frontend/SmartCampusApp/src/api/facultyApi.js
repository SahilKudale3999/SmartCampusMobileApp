import api from "./axios";

export const getAllFaculties = () => {
  return api.get("/faculty");
};

export const getFacultyById = (id) => {
  return api.get(`/faculty/${id}`);
};

export const getFacultyByDepartment = (department) => {
  return api.get(`/faculty/department/${department}`);
};

// Returns FacultyDashboardResponse: facultyName, department, subjects,
// subjectCount, studentCount, assignmentCount, pendingReviews,
// attendancePending, recentActivities, noticeCount.
export const getFacultyDashboard = (facultyId) => {
  return api.get(`/faculty/dashboard/${facultyId}`);
};