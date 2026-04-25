import API from "./api";

export const getPets = (params) => API.get("/pets", { params });
export const getPetById = (id) => API.get(`/pets/${id}`);
export const addPet = (data) => API.post("/pets", data);
export const updatePet = (id, data) => API.put(`/pets/${id}`, data);
export const updatePetStatus = (id, status) => API.put(`/pets/${id}/status`, { status });
export const deletePet = (id) => API.delete(`/pets/${id}`);
