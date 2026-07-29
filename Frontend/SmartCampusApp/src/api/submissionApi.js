import api from "./axios";


export const submitAssignment = (data) => {
  return api.post("/submissions", data);
};

export const getAllSubmissions = () => {
  return api.get("/submissions");
};

export const getSubmissionById = (id) => {
  return api.get(`/submissions/${id}`);
};

export const getSubmissionsByStudent = (studentId) => {
  return api.get(`/submissions/student/${studentId}`);
};

export const getSubmissionsByAssignment = (assignmentId) => {
  return api.get(`/submissions/assignment/${assignmentId}`);
};

export const updateSubmission = (id, data) => {
  return api.put(`/submissions/${id}`, data);
};

export const deleteSubmission = (id) => {
  return api.delete(`/submissions/${id}`);
};

export const gradeSubmission = (id, gradeScore) => {
  return api.patch(`/submissions/${id}/grade`, null, {
    params: { grade: gradeScore },
  });
};