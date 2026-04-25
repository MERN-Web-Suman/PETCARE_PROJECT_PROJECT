import API from "./api";

export const bookAppointment = (data) =>
  API.post("/appointments", data);

export const getAppointments = () =>
  API.get("/appointments");

export const updateAppointment = (id, data) =>
  API.put(`/appointments/${id}`, data);

export const cancelAppointment = (id) =>
  API.delete(`/appointments/${id}`);
