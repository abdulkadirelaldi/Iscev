import api from "./axiosInstance";

const BASE = "/catalogs";

/* ─── Tüm katalogları getir ───────────────────────────────────────────────── */
export const getCatalogs = (params = {}) =>
  api.get(BASE, { params }).then((r) => r.data);

/* ─── Tek katalog getir ───────────────────────────────────────────────────── */
export const getCatalogById = (id) =>
  api.get(`${BASE}/${id}`).then((r) => r.data);

/* ─── Katalog oluştur (FormData — PDF dosyası içerir) ────────────────────── */
export const createCatalog = (formData) =>
  api
    .post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

/* ─── Katalog güncelle (FormData — yeni PDF opsiyonel) ───────────────────── */
export const updateCatalog = (id, formData) =>
  api
    .put(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

/* ─── Katalog sil ─────────────────────────────────────────────────────────── */
export const deleteCatalog = (id) =>
  api.delete(`${BASE}/${id}`).then((r) => r.data);
