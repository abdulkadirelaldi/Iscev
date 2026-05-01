import api from "./axiosInstance";

const BASE = "/references";

export const getReferences    = (params = {}) => api.get(BASE, { params }).then((r) => r.data);
export const getReferenceById = (id)          => api.get(`${BASE}/${id}`).then((r) => r.data);

export const createReference = (formData) =>
  api.post(BASE, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const updateReference = (id, formData) =>
  api.put(`${BASE}/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const deleteReference       = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data);
export const toggleReferenceStatus = (id) => api.patch(`${BASE}/${id}/toggle-status`).then((r) => r.data);
