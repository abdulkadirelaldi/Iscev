import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import AdminRoutes  from "./AdminRoutes";

/* ─── Router Tanımı ──────────────────────────────────────────────────────── */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/">{PublicRoutes}</Route>
      <Route path="/admin">{AdminRoutes}</Route>
    </Route>
  )
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
