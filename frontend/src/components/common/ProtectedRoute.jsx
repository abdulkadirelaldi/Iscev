import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute
 * ──────────────
 * Admin panelinin tüm korunan rotalarını saran wrapper bileşen.
 * Zustand authStore üzerinden isAuthenticated durumunu kontrol eder.
 *
 * Kullanım (router'da):
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 * - Kimlik doğrulanmışsa:  <Outlet /> ile alt rotaları render eder.
 * - Kimlik doğrulanmamışsa: /admin/giris sayfasına yönlendirir.
 *   `replace` prop'u kullanılır — geri tuşuyla korunan sayfaya
 *   dönülmesi engellenir.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/giris" replace />;
  }

  return <Outlet />;
}
