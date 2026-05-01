import api from "./axiosInstance";

const BASE = "/blogs";

export const getBlogs      = (params = {}) => api.get(BASE, { params }).then((r) => r.data);
export const getBlogBySlug = (slug)        => api.get(`${BASE}/${slug}`).then((r) => r.data);
export const getBlogById   = (id)          => api.get(`${BASE}/${id}`).then((r) => r.data);

export const createBlog = (formData) =>
  api.post(BASE, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const updateBlog = (id, formData) =>
  api.put(`${BASE}/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const deleteBlog = (id) => api.delete(`${BASE}/${id}`).then((r) => r.data);
