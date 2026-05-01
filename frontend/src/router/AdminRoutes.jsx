import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import AdminGuard  from "../components/auth/AdminGuard";
import PageLoader  from "../components/ui/PageLoader";

/* ─── Lazy admin sayfaları ────────────────────────────────────────────────── */
const LoginPage           = lazy(() => import("../pages/admin/LoginPage"));
const DashboardPage       = lazy(() => import("../pages/admin/DashboardPage"));
const ProductsAdminPage   = lazy(() => import("../pages/admin/ProductsAdminPage"));
const ServicesAdminPage   = lazy(() => import("../pages/admin/ServicesAdminPage"));
const CatalogsAdminPage   = lazy(() => import("../pages/admin/CatalogsAdminPage"));
const MapAdminPage        = lazy(() => import("../pages/admin/MapAdminPage"));
const BlogAdminPage       = lazy(() => import("../pages/admin/BlogAdminPage"));
const ReferencesAdminPage = lazy(() => import("../pages/admin/ReferencesAdminPage"));
const SettingsAdminPage   = lazy(() => import("../pages/admin/SettingsAdminPage"));
const CategoriesAdminPage = lazy(() => import("../pages/admin/CategoriesAdminPage"));
const MessagesAdminPage   = lazy(() => import("../pages/admin/MessagesAdminPage"));
const ProfileAdminPage    = lazy(() => import("../pages/admin/ProfileAdminPage"));
const CorporateAdminPage  = lazy(() => import("../pages/admin/CorporateAdminPage"));

const wrap = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const AdminRoutes = (
  <Route>
    <Route path="giris" element={wrap(LoginPage)} />

    <Route element={<AdminGuard />}>
      <Route element={<AdminLayout />}>
        <Route index                element={wrap(DashboardPage)} />
        <Route path="urunler"       element={wrap(ProductsAdminPage)} />
        <Route path="hizmetler"     element={wrap(ServicesAdminPage)} />
        <Route path="kataloglar"    element={wrap(CatalogsAdminPage)} />
        <Route path="harita"        element={wrap(MapAdminPage)} />
        <Route path="blog"          element={wrap(BlogAdminPage)} />
        <Route path="referanslar"   element={wrap(ReferencesAdminPage)} />
        <Route path="ayarlar"       element={wrap(SettingsAdminPage)} />
        <Route path="kategoriler"   element={wrap(CategoriesAdminPage)} />
        <Route path="mesajlar"      element={wrap(MessagesAdminPage)} />
        <Route path="profil"        element={wrap(ProfileAdminPage)} />
        <Route path="kurumsal"      element={wrap(CorporateAdminPage)} />
      </Route>
    </Route>
  </Route>
);

export default AdminRoutes;
