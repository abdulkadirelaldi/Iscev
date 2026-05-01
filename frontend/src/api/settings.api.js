import api from "./axiosInstance";

const BASE = "/site-settings";

export const getSettings       = ()         => api.get(BASE).then((r) => r.data);
export const updateContactInfo = (body)     => api.put(`${BASE}/contact`, body).then((r) => r.data);
export const updateIntroVideo  = (formData) =>
  api.put(`${BASE}/video`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
export const deleteIntroVideo  = ()         => api.delete(`${BASE}/video`).then((r) => r.data);
