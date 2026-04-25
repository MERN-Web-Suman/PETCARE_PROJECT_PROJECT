import API from "./api";

export const getPosts = () => API.get("/posts");
export const createPost = (data) => API.post("/posts", data);
export const likePost = (id, userId) => API.post(`/posts/${id}/like`, { userId });
export const addComment = (id, data) => API.post(`/posts/${id}/comment`, data);
