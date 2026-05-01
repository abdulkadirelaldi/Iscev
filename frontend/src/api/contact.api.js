import api from "./axiosInstance";

export const submitContact  = (data)          => api.post("/contact", data);
export const getMessages    = (params)         => api.get("/contact", { params });
export const getUnreadCount = ()               => api.get("/contact/unread-count");
export const markAsRead     = (id)             => api.patch(`/contact/${id}/read`);
export const replyMessage   = (id, replyText)  => api.post(`/contact/${id}/reply`, { replyText });
export const deleteMessage  = (id)             => api.delete(`/contact/${id}`);
