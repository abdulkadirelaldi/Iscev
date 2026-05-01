import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import AdminSidebar from "./AdminSidebar";
import AdminHeader  from "./AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen font-gilroy"
      style={{ background: "#F0F4FA" }}   /* Su mavisi tonunda ferah arkaplan */
    >
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {/* ── Mobil Sidebar (overlay) ───────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Karartma */}
            <motion.div
              key="overlay"
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar panel */}
            <motion.div
              key="mobile-sidebar"
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <AdminSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Sağ Alan: Header + İçerik ─────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Sayfa geçiş animasyonu */}
          <motion.div
            key={typeof window !== "undefined" ? window.location.pathname : ""}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
