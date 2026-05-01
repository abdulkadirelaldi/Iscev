import { useState } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/* ─── Route → Başlık eşleme ───────────────────────────────────────────────── */
const PAGE_TITLES = {
  "/admin":             "Dashboard",
  "/admin/hero":        "Hero Yönetimi",
  "/admin/urunler":     "Ürünler",
  "/admin/hizmetler":   "Hizmetler",
  "/admin/referanslar": "Referanslar",
  "/admin/blog":        "Blog",
  "/admin/kataloglar":  "Kataloglar",
  "/admin/harita":      "Harita Yönetimi",
  "/admin/ayarlar":     "Site Ayarları",
};

/* ─── Bildirim İkonu ──────────────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

/* ─── Dış Link İkonu ──────────────────────────────────────────────────────── */
function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────────────────────────────── */
export default function AdminHeader({ onMenuToggle }) {
  const { pathname } = useLocation();
  const { admin }    = useAuthStore();
  const [hasNotif]   = useState(false); // ileride bildirim sistemi entegre edilir

  const pageTitle = PAGE_TITLES[pathname] ?? "Yönetim Paneli";

  return (
    <header
      className="
        sticky top-0 z-30
        flex items-center justify-between
        h-16 px-6
        bg-white border-b border-gray-100
        shadow-sm font-gilroy
      "
    >
      {/* Sol: Hamburger (mobil) + Sayfa başlığı */}
      <div className="flex items-center gap-4">
        {/* Hamburger — mobilde sidebar'ı aç/kapat */}
        <button
          onClick={onMenuToggle}
          aria-label="Menüyü aç/kapat"
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <h1
            className="text-base font-bold leading-none"
            style={{ color: "#1B3F84" }}
          >
            {pageTitle}
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day:     "numeric",
              month:   "long",
              year:    "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Sağ: Aksiyonlar */}
      <div className="flex items-center gap-2">
        {/* Siteye git */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="
            hidden sm:flex items-center gap-1.5
            text-xs font-medium px-3 py-2 rounded-lg
            text-gray-500 hover:text-iscev-navy hover:bg-gray-50
            transition-colors duration-150
          "
        >
          <ExternalLinkIcon />
          Siteyi Görüntüle
        </a>

        {/* Bildirimler */}
        <button
          aria-label="Bildirimler"
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <BellIcon />
          {hasNotif && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ml-1 cursor-default select-none"
          style={{ background: "#1B3F84" }}
          title={admin?.name ?? "Yönetici"}
        >
          {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
        </div>
      </div>
    </header>
  );
}
