import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { getUnreadCount } from "../../api/contact.api";
import { logout as logoutApi } from "../../api/auth.api";

/* ─── Menü Tanımları ──────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    group: null,
    items: [
      {
        label: "Dashboard",
        to:    "/admin",
        end:   true,
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "İçerik",
    items: [
      {
        label: "Ürünler",
        to:    "/admin/urunler",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
      },
      {
        label: "Kategoriler",
        to:    "/admin/kategoriler",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        label: "Hizmetler",
        to:    "/admin/hizmetler",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        ),
      },
      {
        label: "Referanslar",
        to:    "/admin/referanslar",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        label: "Kurumsal Sayfa",
        to:    "/admin/kurumsal",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5m4 0H9" />
          </svg>
        ),
      },
      {
        label: "Blog",
        to:    "/admin/blog",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Medya & Lokasyon",
    items: [
      {
        label: "Kataloglar",
        to:    "/admin/kataloglar",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        ),
      },
      {
        label: "Harita Yönetimi",
        to:    "/admin/harita",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "İletişim",
    items: [
      {
        label: "Gelen Kutusu",
        to:    "/admin/mesajlar",
        badge: true,
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Sistem",
    items: [
      {
        label: "Profilim",
        to:    "/admin/profil",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
          </svg>
        ),
      },
      {
        label: "Site Ayarları",
        to:    "/admin/ayarlar",
        icon:  (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

/* ─── NavLink stil yardımcısı ─────────────────────────────────────────────── */
const navLinkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
    "transition-all duration-150 group",
    isActive
      ? "bg-iscev-navy text-white shadow-sm"
      : "text-slate-400 hover:bg-white/8 hover:text-white",
  ].join(" ");

/* ─── Çıkış İkonu ─────────────────────────────────────────────────────────── */
function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────────────────────────────── */
export default function AdminSidebar() {
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadCount()
      .then((r) => {
        const raw = r?.data ?? r;
        setUnreadCount(raw?.data?.count ?? raw?.count ?? 0);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await logoutApi(); } catch (_) {}
    logout();
    navigate("/admin/giris", { replace: true });
  };

  return (
    <aside
      className="flex flex-col w-64 min-h-screen shrink-0 font-gilroy"
      style={{ background: "#111c31" }}
    >
      {/* ── Logo / Marka ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <img
          src="/logo-white.svg"
          alt="İSÇEV"
          className="h-10 w-auto"
        />
        <span
          className="text-[10px] font-semibold shrink-0 whitespace-nowrap"
          style={{ color: "#4988C5" }}
        >
          Admin OS
        </span>
      </div>

      {/* ── Navigasyon ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_ITEMS.map(({ group, items }) => (
          <div key={group ?? "__root"}>
            {group && (
              <p
                className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {group}
              </p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ label, to, end, icon, badge }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={navLinkClass}>
                    <span className="shrink-0 opacity-80 group-[.active]:opacity-100">
                      {icon}
                    </span>
                    {label}
                    {badge && unreadCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Alt: Kullanıcı Kartı & Çıkış ─────────────────────────────────── */}
      <div
        className="px-3 py-4 border-t space-y-2"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        {/* Admin adı */}
        <Link
          to="/admin/profil"
          className="flex items-center gap-3 px-3 py-2 rounded-lg
                     hover:bg-white/8 transition-colors duration-150 cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "#1B3F84" }}
          >
            {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="leading-tight overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">
              {admin?.name ?? "Yönetici"}
            </p>
            <p
              className="text-[10px] truncate"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {admin?.email ?? ""}
            </p>
          </div>
        </Link>

        {/* Çıkış butonu */}
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-sm font-medium transition-colors duration-150
            text-red-400 hover:bg-red-500/10 hover:text-red-300
          "
        >
          <LogoutIcon />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
