import api from "./axios";

export const createStudent = (request) => {
  return api.post("/students", request);
};