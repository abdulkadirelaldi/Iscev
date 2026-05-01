import api from './axiosInstance';

/**
 * Map Location API — /api/v1/map-locations
 * ─────────────────────────────────────────
 * Public fonksiyonlar kimlik doğrulaması gerektirmez.
 * Admin fonksiyonları axiosInstance interceptor'ı aracılığıyla
 * otomatik olarak Authorization: Bearer <token> header'ı ekler.
 */

/* ─── PUBLIC ─────────────────────────────────────────────────────────────── */

/**
 * Harita için yalnızca aktif (isActive: true) pinleri getirir.
 * @returns {Promise} data.locations — lokasyon dizisi
 */
export const getActiveMapLocations = () =>
  api.get('/map-locations', { params: { isActive: true } });

/**
 * Tekil lokasyonu ID ile getirir.
 * @param {string} id — MongoDB ObjectId
 */
export const getMapLocationById = (id) =>
  api.get(`/map-locations/${id}`);

/* ─── ADMIN (Protected) ──────────────────────────────────────────────────── */

/**
 * Yönetim paneli için tüm pinleri getirir (aktif + pasif).
 */
export const getAllMapLocations = () =>
  api.get('/map-locations');

/**
 * Yeni santral/proje pini oluşturur.
 * Backend multipart/form-data bekler (Multer).
 *
 * FormData alanları:
 *   projectName  {string}  — zorunlu
 *   latitude     {number}  — zorunlu
 *   longitude    {number}  — zorunlu
 *   description  {string}  — opsiyonel
 *   country      {string}  — opsiyonel
 *   isActive     {boolean} — opsiyonel, varsayılan: true
 *   image        {File}    — opsiyonel, .jpg/.png, max 5MB
 *
 * @param {FormData} formData
 */
export const createMapLocation = (formData) =>
  api.post('/map-locations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Mevcut bir pini günceller.
 * Yalnızca gönderilen alanlar değişir (partial update).
 *
 * @param {string}   id       — MongoDB ObjectId
 * @param {FormData} formData — Güncellenecek alanlar
 */
export const updateMapLocation = (id, formData) =>
  api.put(`/map-locations/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Pini ve sunucudaki görsel dosyasını siler.
 * @param {string} id — MongoDB ObjectId
 */
export const deleteMapLocation = (id) =>
  api.delete(`/map-locations/${id}`);
