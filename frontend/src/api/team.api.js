import api from "./axiosInstance";

export const getTeamAdmin = ()       => api.get("/team/admin");
export const createMember = (fd)     => api.post("/team", fd, { headers: { "Content-Type": "multipart/form-data" } });
export const updateMember = (id, fd) => api.put(`/team/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteMember = (id)     => api.delete(`/team/${id}`);
