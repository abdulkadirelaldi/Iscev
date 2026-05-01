import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

const YEAR = new Date().getFullYear();

/* ─── Veri ────────────────────────────────────────────────────────────────── */
const QUICK_LINKS = [
  { label: "Ana Sayfa",  to: "/" },
  { label: "Kurumsal",   to: "/kurumsal" },
  { label: "Ürünler",    to: "/urunler" },
  { label: "Hizmetler",  to: "/hizmetler" },
  { label: "Kataloglar", to: "/kataloglar" },
  { label: "Blog",       to: "/blog" },
  { label: "İletişim",   to: "/iletisim" },
];

const SERVICE_LINKS = [
  { label: "Endüstriyel Su Arıtma",    to: "/hizmetler" },
  { label: "Atık Su Geri Kazanımı",    to: "/hizmetler" },
  { label: "Anahtar Teslim Tesisler",  to: "/hizmetler" },
  { label: "Bakım & Teknik Destek",    to: "/hizmetler" },
  { label: "Danışmanlık & Fizibilite", to: "/hizmetler" },
];

const LEGAL_LINKS = [
  { label: "Gizlilik Politikası",      to: "/gizlilik" },
  { label: "KVKK Aydınlatma Metni",    to: "/kvkk" },
  { label: "Çerez Politikası",         to: "/cerez-politikasi" },
];

/* ─── İkonlar (inline SVG — react-icons gerektirmez) ─────────────────────── */
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

// SOCIAL sabit listesi kaldırıldı — dinamik SOCIAL_DYNAMIC kullanılıyor

/* ─── Sütun başlığı ───────────────────────────────────────────────────────── */
function ColTitle({ children }) {
  return (
    <h4 className="font-gilroy font-bold text-sm uppercase tracking-widest mb-5"
      style={{ color: "#DDE9F8" }}>
      {children}
    </h4>
  );
}

/* ─── Liste linki ─────────────────────────────────────────────────────────── */
function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-2 text-sm transition-colors duration-150 group"
        style={{ color: "rgba(221,233,248,0.65)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#4988C5")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(221,233,248,0.65)")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                     transition-all duration-150 shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {children}
      </Link>
    </li>
  );
}

/* ─── İletişim satırı ─────────────────────────────────────────────────────── */
function ContactRow({ iconPath, children, href }) {
  const Inner = () => (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: "#4988C5" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d={iconPath} />
        </svg>
      </span>
      <span className="text-sm leading-snug" style={{ color: "rgba(221,233,248,0.75)" }}>
        {children}
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href}
        className="block transition-opacity duration-150 hover:opacity-80">
        <Inner />
      </a>
    );
  }
  return <div><Inner /></div>;
}

/* ─── Ana Footer ──────────────────────────────────────────────────────────── */
export default function Footer() {
  const { contactInfo } = useSettings() ?? {};

  const address  = contactInfo?.address  || "Sanayi Mahallesi, 100. Yıl Bulvarı No: 28, 55060 İlkadım / Samsun";
  const phone    = contactInfo?.phone    || "+90 (362) 123 45 67";
  const email    = contactInfo?.email    || "info@iscev.com";
  const linkedin = contactInfo?.linkedinUrl  || "https://linkedin.com/company/iscev";
  const instagram= contactInfo?.instagramUrl || "https://instagram.com/iscev";

  const SOCIAL_DYNAMIC = [
    { label: "LinkedIn",  href: linkedin,  Icon: LinkedInIcon  },
    { label: "Instagram", href: instagram, Icon: InstagramIcon },
    { label: "X",         href: "https://x.com/iscev",         Icon: TwitterXIcon  },
    { label: "YouTube",   href: "https://youtube.com/@iscev",   Icon: YouTubeIcon   },
  ];

  return (
    <footer style={{ background: "#1B3F84" }}>

      {/* ── Üst dekoratif şerit ───────────────────────────────────────── */}
      <div className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, #1B3F84, #4988C5, #DDE9F8, #4988C5, #1B3F84)" }} />

      {/* ── Ana içerik grid ───────────────────────────────────────────── */}
      <div className="container-iscev py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

        {/* ── 1. Sütun: Hakkımızda ──────────────────────────────────── */}
        <div className="lg:col-span-1">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-5 w-fit">
            <img
              src="/logo-white.svg"
              alt="İSÇEV Arıtma ve Çevre Teknolojileri"
              className="h-12 w-auto"
            />
          </Link>

          <p className="text-sm leading-relaxed mb-6"
            style={{ color: "rgba(221,233,248,0.7)" }}>
            1999'dan bu yana endüstriyel su arıtma ve çevre teknolojileri alanında
            18'den fazla ülkede sürdürülebilir çözümler sunuyoruz.
          </p>

          {/* Sertifika rozetleri */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["ISO 9001", "ISO 14001", "TSE"].map((cert) => (
              <span key={cert}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                style={{ borderColor: "rgba(221,233,248,0.3)", color: "#DDE9F8" }}>
                {cert}
              </span>
            ))}
          </div>

          {/* Sosyal medya */}
          <div className="flex items-center gap-2">
            {SOCIAL_DYNAMIC.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                           transition-all duration-150 hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.1)", color: "#DDE9F8" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4988C5";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#DDE9F8";
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* ── 2. Sütun: Hızlı Bağlantılar ──────────────────────────── */}
        <div>
          <ColTitle>Hızlı Bağlantılar</ColTitle>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map(({ label, to }) => (
              <FooterLink key={to} to={to}>{label}</FooterLink>
            ))}
          </ul>
        </div>

        {/* ── 3. Sütun: Hizmetlerimiz ───────────────────────────────── */}
        <div>
          <ColTitle>Hizmetlerimiz</ColTitle>
          <ul className="space-y-2.5">
            {SERVICE_LINKS.map(({ label, to }) => (
              <FooterLink key={label} to={to}>{label}</FooterLink>
            ))}
          </ul>

          {/* Katalog CTA */}
          <Link
            to="/kataloglar"
            className="mt-6 flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl
                       w-fit transition-all duration-150 hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#4988C5", color: "#fff" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Katalogları İndir
          </Link>
        </div>

        {/* ── 4. Sütun: İletişim ────────────────────────────────────── */}
        <div>
          <ColTitle>İletişim</ColTitle>
          <div className="space-y-4">
            {address && (
              <ContactRow iconPath="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z">
                {address}
              </ContactRow>
            )}
            {phone && (
              <ContactRow
                iconPath="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z"
                href={`tel:${phone.replace(/\s/g, "")}`}
              >
                {phone}
              </ContactRow>
            )}
            {email && (
              <ContactRow
                iconPath="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
                href={`mailto:${email}`}
              >
                {email}
              </ContactRow>
            )}
            <ContactRow iconPath="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm1-13v4l3 3">
              Pzt – Cum: 08:30 – 17:30
            </ContactRow>
          </div>
        </div>

      </div>

      {/* ── Alt bar ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(221,233,248,0.12)" }}>
        <div className="container-iscev py-5 flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-xs"
          style={{ color: "rgba(221,233,248,0.45)" }}>

          {/* Telif hakkı */}
          <p>© {YEAR} İSÇEV Arıtma ve Çevre Teknolojileri A.Ş. Tüm hakları saklıdır.</p>

          {/* Yasal linkler */}
          <div className="flex items-center flex-wrap justify-center gap-x-5 gap-y-1">
            {LEGAL_LINKS.map(({ label, to }, i) => (
              <span key={to} className="flex items-center gap-5">
                <Link
                  to={to}
                  className="transition-colors duration-150 hover:text-[#4988C5]"
                  style={{ color: "rgba(221,233,248,0.45)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#4988C5")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(221,233,248,0.45)")}
                >
                  {label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span style={{ color: "rgba(221,233,248,0.2)" }}>·</span>
                )}
              </span>
            ))}
          </div>

        </div>
      </div>

    </footer>
  );
}
