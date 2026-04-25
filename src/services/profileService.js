import API from "./api";

export const getProfileStats = () => API.get("/profile/stats");
export const getRecentActivity = () => API.get("/profile/activity");
export const getSavedPets = () => API.get("/profile/saved");
export const toggleSavePet = (id) => API.post(`/profile/save/${id}`);
