import api from "./axiosInstance";

const BASE = "/products";

/* ─── Tüm ürünleri getir ──────────────────────────────────────────────────── */
export const getProducts = (params = {}) =>
  api.get(BASE, { params }).then((r) => r.data);

/* ─── Tek ürün getir ──────────────────────────────────────────────────────── */
export const getProductBySlug = (slug) =>
  api.get(`${BASE}/${slug}`).then((r) => r.data);

export const getProductById = (id) =>
  api.get(`${BASE}/${id}`).then((r) => r.data);

/* ─── Ürün oluştur  (FormData — görsel içerebilir) ───────────────────────── */
export const createProduct = (formData) =>
  api
    .post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

/* ─── Ürün güncelle (FormData — görsel içerebilir) ───────────────────────── */
export const updateProduct = (id, formData) =>
  api
    .put(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

/* ─── Ürün sil ────────────────────────────────────────────────────────────── */
export const deleteProduct = (id) =>
  api.delete(`${BASE}/${id}`).then((r) => r.data);

/* ─── Ürün durumunu toggle et (aktif/pasif) ──────────────────────────────── */
export const toggleProductStatus = (id) =>
  api.patch(`${BASE}/${id}/toggle-status`).then((r) => r.data);
