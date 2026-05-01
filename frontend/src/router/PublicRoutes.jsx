import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import PageLoader   from "../components/ui/PageLoader";

/* ─── Lazy sayfalar ───────────────────────────────────────────────────────── */
const HomePage          = lazy(() => import("../pages/public/HomePage"));
const AboutPage         = lazy(() => import("../pages/public/AboutPage"));
const ProductsPage      = lazy(() => import("../pages/public/ProductsPage"));
const ProductDetail     = lazy(() => import("../pages/public/ProductDetail"));
const ServicesPage      = lazy(() => import("../pages/public/ServicesPage"));
const ServiceDetail     = lazy(() => import("../pages/public/ServiceDetail"));
const CatalogsPage      = lazy(() => import("../pages/public/CatalogsPage"));
const ReferencesPage    = lazy(() => import("../pages/public/ReferencesPage"));
const MapPage           = lazy(() => import("../pages/public/MapPage"));
const MapLocationDetail = lazy(() => import("../pages/public/MapLocationDetail"));
const BlogPage          = lazy(() => import("../pages/public/BlogPage"));
const BlogDetail        = lazy(() => import("../pages/public/BlogDetail"));
const ContactPage       = lazy(() => import("../pages/public/ContactPage"));
const NotFoundPage      = lazy(() => import("../pages/public/NotFoundPage"));

const PublicRoutes = (
  <Route element={<PublicLayout />}>
    <Route element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>}            index />
    <Route element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>}           path="kurumsal" />
    <Route element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>}        path="urunler" />
    <Route element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>}       path="urunler/:slug" />
    <Route element={<Suspense fallback={<PageLoader />}><ServicesPage /></Suspense>}        path="hizmetler" />
    <Route element={<Suspense fallback={<PageLoader />}><ServiceDetail /></Suspense>}       path="hizmetler/:slug" />
    <Route element={<Suspense fallback={<PageLoader />}><CatalogsPage /></Suspense>}        path="kataloglar" />
    <Route element={<Suspense fallback={<PageLoader />}><ReferencesPage /></Suspense>}      path="referanslar" />
    <Route element={<Suspense fallback={<PageLoader />}><MapPage /></Suspense>}             path="dunya-haritasi" />
    <Route element={<Suspense fallback={<PageLoader />}><MapLocationDetail /></Suspense>}   path="dunya-haritasi/:id" />
    <Route element={<Suspense fallback={<PageLoader />}><BlogPage /></Suspense>}            path="blog" />
    <Route element={<Suspense fallback={<PageLoader />}><BlogDetail /></Suspense>}          path="blog/:slug" />
    <Route element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>}         path="iletisim" />
    <Route element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>}        path="*" />
  </Route>
);

export default PublicRoutes;
