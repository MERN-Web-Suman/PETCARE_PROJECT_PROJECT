import api from "./api";

export const createOutingRequest = (data) => api.post("/outing-requests", data);
export const getOwnerOutingRequests = () => api.get("/outing-requests/owner");
export const getRequesterOutingRequests = () => api.get("/outing-requests/my-requests");
export const updateOutingRequestStatus = (id, status) => api.put(`/outing-requests/${id}/status`, { status });
