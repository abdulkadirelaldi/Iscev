import api from "./axiosInstance";

/**
 * Admin girişi — POST /api/v1/auth/login
 * Token httpOnly cookie olarak set edilir, JS erişemez.
 * Yanıt: { success, message, data: { admin } }
 */
export const login = (credentials) =>
  api.post("/auth/login", credentials).then((r) => r.data.data);

/**
 * Admin çıkışı — POST /api/v1/auth/logout
 * Sunucu httpOnly cookie'yi clearCookie ile temizler.
 */
export const logout = () =>
  api.post("/auth/logout").then((r) => r.data);

/**
 * Token doğrulama — GET /api/v1/auth/me
 * Cookie otomatik gönderilir (withCredentials: true).
 */
export const getMe = () =>
  api.get("/auth/me").then((r) => r.data.data);
