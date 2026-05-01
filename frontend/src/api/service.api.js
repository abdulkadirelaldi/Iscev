import api from "./axiosInstance";

const BASE = "/services";

export const getServices      = (params = {}) => api.get(BASE, { params }).then((r) => r.data);
export const getServiceBySlug = (slug)        => api.get(`${BASE}/${slug}`).then((r) => r.data);
export const getServiceById   = (id)          => api.get(`${BASE}/${id}`).then((r) => r.data);

export const createService = (formData) =>
  api.post(BASE, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const updateService = (id, formData) =>
  api.put(`${BASE}/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const deleteService         = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data);
export const toggleServiceStatus   = (id) => api.patch(`${BASE}/${id}/toggle-status`).then((r) => r.data);
