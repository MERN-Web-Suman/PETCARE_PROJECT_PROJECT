import api from "./api";

export const createPetAppointment = (data) => api.post("/pet-appointments", data);
export const getOwnerPetAppointments = () => api.get("/pet-appointments/owner");
export const getRequesterPetAppointments = () => api.get("/pet-appointments/my-requests");
export const updatePetAppointmentStatus = (id, status) => api.put(`/pet-appointments/${id}/status`, { status });
