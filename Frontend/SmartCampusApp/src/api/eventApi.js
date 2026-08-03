import api from "./axios";

export const getAllEvents = () => {
  return api.get("/event");
};

export const getUpcomingEvents = () => {
  return api.get("/event/upcoming");
};

export const getEventById = (id) => {
  return api.get(`/event/${id}`);
};

export const createEvent = (eventData) => {
  // eventData: { eventName, description, venue, eventDate, createdBy }
  return api.post("/event", eventData);
};

export const updateEvent = (id, eventData) => {
  return api.put(`/event/${id}`, eventData);
};

export const deleteEvent = (id) => {
  return api.delete(`/event/${id}`);
};