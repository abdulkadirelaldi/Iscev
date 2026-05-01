import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Ana Sayfa",      to: "/" },
  { label: "Kurumsal",       to: "/kurumsal" },
  { label: "Ürünler",        to: "/urunler" },
  { label: "Hizmetler",      to: "/hizmetler" },
  { label: "Kataloglar",     to: "/kataloglar" },
  { label: "Referanslar",    to: "/referanslar" },
  { label: "Blog",           to: "/blog" },
  { label: "İletişim",       to: "/iletisim" },
];

export default function Header() {
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const mobileNavRef                    = useRef(null);
  const location                        = useLocation();

  /* Sayfa değişince mobil menüyü kapat */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Dışarı tıklayınca kapat */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "#1B3F84",
        boxShadow: scrolled ? "0 2px 16px rgba(27,63,132,0.18)" : "none",
        transition: "box-shadow 0.2s",
      }}
    >
      <div className="container-iscev relative z-50 flex items-center justify-between h-16">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center shrink-0 select-none"
          style={{ textDecoration: "none" }}
        >
          <img
            src="/logo-white.svg"
            alt="İSÇEV Arıtma ve Çevre Teknolojileri"
            className="h-12 w-auto"
          />
        </Link>

        {/* ── Masaüstü Menü ─────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Ana menü">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                  "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  isActive
                    ? "text-white bg-white/15"
                    : "text-white/80 hover:text-white",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Masaüstü CTA ──────────────────────────────────────────── */}
        <Link
          to="/iletisim"
          className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm
                     font-semibold shrink-0 transition-all duration-150
                     hover:opacity-90 active:scale-[0.97]"
          style={{ background: "#4988C5", color: "#fff" }}
        >
          Teklif Al
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>

        {/* ── Hamburger ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
          className="md:hidden relative z-50 flex items-center justify-center w-10 h-10
                     rounded-xl text-white transition-colors duration-150
                     hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-white/50"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobil Menü ──────────────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        ref={mobileNavRef}
        aria-hidden={!menuOpen}
        className="md:hidden overflow-hidden transition-all duration-250"
        style={{
          maxHeight: menuOpen ? "520px" : "0px",
          opacity:   menuOpen ? 1 : 0,
          transition: "max-height 0.28s ease, opacity 0.2s ease",
        }}
      >
        <nav
          className="flex flex-col gap-1 px-4 pb-5 pt-1 border-t"
          style={{ borderColor: "rgba(221,233,248,0.15)" }}
          aria-label="Mobil menü"
        >
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}

          <Link
            to="/iletisim"
            className="mt-3 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl
                       text-sm font-semibold transition-all duration-150
                       hover:opacity-90 active:scale-[0.97]"
            style={{ background: "#4988C5", color: "#fff" }}
          >
            Teklif Al
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
