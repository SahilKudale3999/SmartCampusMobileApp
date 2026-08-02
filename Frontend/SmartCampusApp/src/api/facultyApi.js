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


export const createFaculty = (facultyData) => {
  return api.post("/faculty", facultyData);

};