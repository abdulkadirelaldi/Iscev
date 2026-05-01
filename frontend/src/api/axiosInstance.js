import axios from 'axios';
import useAuthStore from '../store/authStore';

/**
 * Merkezi Axios Instance
 * ─────────────────────
 * withCredentials: true ile httpOnly cookie otomatik gönderilir.
 * Token localStorage'da veya JS state'inde tutulmaz — XSS güvenli.
 */
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
   401 / 403 → Store'u temizle ve giriş sayfasına yönlendir.
   Cookie sunucu tarafından clearCookie ile temizlenir (/api/v1/auth/logout).
─────────────────────────────────────────────────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      try {
        useAuthStore.getState().logout();
      } catch (_) {}

      localStorage.removeItem('iscev_admin_auth');
      window.location.replace('/admin/giris');
    }

    return Promise.reject(error);
  }
);

export default api;
