/* Admin rotalarını Zustand auth store üzerinden korur */
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function AdminGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/giris" replace />;
  }

  return <Outlet />;
}
