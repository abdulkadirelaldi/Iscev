import { useState } from "react";

/**
 * Props:
 *  title   string  — Katalog adı
 *  pdfUrl  string  — PDF tam URL (indirme + görüntüleme için)
 *  date    string  — ISO tarih (opsiyonel)
 *  lang    string  — "TR" / "EN" vb. (opsiyonel)
 *  size    string  — "1.2 MB" (opsiyonel)
 */
export default function CatalogCard({ title, pdfUrl, date, lang, size }) {
  const [hovered, setHovered] = useState(false);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #DDE9F8",
        background: "#fff",
        boxShadow: hovered
          ? "0 12px 32px rgba(27,63,132,0.13)"
          : "0 2px 8px rgba(27,63,132,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Üst mavi band ── */}
      <div
        style={{
          height: "112px",
          background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dekoratif daire */}
        <div
          style={{
            position: "absolute",
            right: "-20px",
            top: "-20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(221,233,248,0.12)",
          }}
        />
        {/* PDF ikonu */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "26px", height: "26px" }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>

        {/* Dil etiketi */}
        {lang && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "12px",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "2px 8px",
              borderRadius: "99px",
            }}
          >
            {lang}
          </span>
        )}
      </div>

      {/* ── İçerik ── */}
      <div style={{ padding: "16px 20px 12px", flexGrow: 1 }}>
        <p
          className="font-gilroy font-bold"
          style={{
            color: "#1B3F84",
            fontSize: "14px",
            lineHeight: "1.45",
            marginBottom: "8px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {formattedDate && (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              {formattedDate}
            </span>
          )}
          {size && (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>{size}</span>
          )}
        </div>
      </div>

      {/* ── Alt buton çubuğu ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: "1px solid #DDE9F8",
        }}
      >
        {/* İndir */}
        <a
          href={pdfUrl}
          download
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 0",
            fontSize: "12px",
            fontWeight: 600,
            color: "#1B3F84",
            textDecoration: "none",
            transition: "background 0.15s",
            borderRight: "1px solid #DDE9F8",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#DDE9F8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" style={{ width: "13px", height: "13px" }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          İndir
        </a>

        {/* İncele */}
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "10px 0",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4988C5",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#DDE9F8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" style={{ width: "13px", height: "13px" }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 0 1-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          İncele
        </a>
      </div>
    </div>
  );
}
