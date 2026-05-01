import api from "./axiosInstance";

const BASE = "/categories";

/**
 * Tüm kategorileri getirir.
 * Backend yanıtı: { success, message, data: { categories: [...] } }
 * @returns {Promise<Array>} categories dizisi
 */
export const getCategories = () =>
  api.get(BASE).then((r) => {
    const raw  = r?.data?.data ?? r?.data ?? r;
    const list = raw?.categories ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  });

/**
 * Yeni kategori oluşturur.
 * @param {{ name: string }} body
 */
export const createCategory = (body) =>
  api.post(BASE, body).then((r) => r.data.data.category);

/**
 * Kategoriyi siler.
 * Not: Bağlı ürün varsa backend 409 döner.
 * @param {string} id — MongoDB ObjectId
 */
export const deleteCategory = (id) =>
  api.delete(`${BASE}/${id}`).then((r) => r.data);
