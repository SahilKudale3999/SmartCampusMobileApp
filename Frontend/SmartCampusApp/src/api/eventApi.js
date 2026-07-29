import api from "./axios";

export const getAllEvents = () => {
  return api.get("/event");
};

export const getEventById = (id) => {
  return api.get(`/event/${id}`);
};