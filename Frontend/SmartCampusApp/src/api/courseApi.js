import api from "./axios";

export const getAllCourses = () => {
  return api.get("/courses");
};