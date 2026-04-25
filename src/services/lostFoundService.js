import API from "./api";

export const getLostFounds = () => API.get("/lostfound");
export const createLostFound = (data) => API.post("/lostfound", data);
export const updateLostFound = (id, data) => API.put(`/lostfound/${id}`, data);
export const deleteLostFound = (id) => API.delete(`/lostfound/${id}`);
