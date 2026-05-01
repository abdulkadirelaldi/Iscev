import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getMapLocationById } from "../../api/mapLocation.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const imgUrl = (path) => (path ? `${UPLOADS_BASE}/${path}` : null);

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse font-gilroy">
      <div className="w-full bg-gray-200" style={{ height: 420 }} />
      <div className="container-iscev py-12 space-y-4 max-w-3xl">
        <div className="h-4 bg-gray-100 rounded-full w-24" />
        <div className="h-8 bg-gray-200 rounded-full w-2/3" />
        <div className="space-y-3 mt-8">
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-5/6" />
          <div className="h-3 bg-gray-100 rounded-full w-4/6" />
        </div>
      </div>
    </div>
  );
}

/* ─── Bulunamadı ──────────────────────────────────────────────────────────── */
function NotFound({ onBack }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 font-gilroy px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#DDE9F8" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: "#1B3F84" }}>
          Lokasyon Bulunamadı
        </h2>
        <p className="text-sm text-gray-500">
          Aradığınız lokasyon mevcut değil veya kaldırılmış olabilir.
        </p>
      </div>
      <button onClick={onBack}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "#1B3F84" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Haritaya Geri Dön
      </button>
    </div>
  );
}

/* ─── Bilgi Kartı ─────────────────────────────────────────────────────────── */
function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl"
      style={{ background: "#F0F5FC" }}>
      <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: "#DDE9F8" }}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide uppercase mb-0.5"
          style={{ color: "#4988C5" }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: "#1B3F84" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────────────────────────────── */
export default function MapLocationDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [location,  setLocation]  = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const res  = await getMapLocationById(id);
      const data = res?.data?.data?.location ?? res?.data?.location ?? res?.data ?? res;
      if (!data?._id) throw new Error("empty");
      setLocation(data);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) return <Skeleton />;
  if (notFound || !location) return <NotFound onBack={() => navigate("/dunya-haritasi")} />;

  const coverSrc = imgUrl(location.imageFilePath);
  const lat      = location.location?.coordinates?.[1];
  const lng      = location.location?.coordinates?.[0];
  const mapsUrl  = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="font-gilroy"
    >
      <PageSEO
        title={location.projectName}
        description={location.description || `${location.projectName} — İSÇEV proje lokasyonu`}
        canonical={`/dunya-haritasi/${location._id}`}
        image={location.imageFilePath ? `/${location.imageFilePath}` : undefined}
      />

      {/* ① Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden"
        style={{ maxHeight: 420, minHeight: 280, background: "#0d1f42" }}>

        {coverSrc ? (
          <img
            src={coverSrc}
            alt={location.projectName}
            className="w-full object-cover"
            style={{ maxHeight: 420, width: "100%" }}
          />
        ) : (
          <div className="w-full flex items-center justify-center" style={{
            height: 420,
            background: "linear-gradient(135deg, #1B3F84 0%, #0d1f42 100%)",
          }}>
            {/* Dekoratif harita ikonu */}
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)"
              strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 120, height: 120 }}>
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, transparent 30%, rgba(13,31,66,0.80) 100%)",
        }} />

        {/* Başlık */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 sm:px-10 sm:py-10">
          <div className="container-iscev">
            {location.country && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                               text-[11px] font-bold tracking-wide mb-3"
                style={{ background: "#DDE9F8", color: "#1B3F84" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {location.country}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-gilroy font-bold
                           text-white leading-tight">
              {location.projectName}
            </h1>
          </div>
        </div>
      </div>

      {/* ② İçerik ──────────────────────────────────────────────────────────── */}
      <section className="py-12" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev max-w-3xl">

          {/* Açıklama */}
          {location.description && (
            <p className="text-[15px] leading-relaxed text-gray-600 mb-8">
              {location.description}
            </p>
          )}

          {/* Bilgi kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {location.country && (
              <InfoCard
                label="Ülke"
                value={location.country}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                }
              />
            )}
            {lat != null && lng != null && (
              <InfoCard
                label="Koordinatlar"
                value={`${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10
                             15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                }
              />
            )}
          </div>

          {/* Google Maps bağlantısı */}
          {lat != null && lng != null && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                         text-sm font-semibold text-white transition-opacity duration-150
                         hover:opacity-90"
              style={{ background: "#4988C5" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
              Google Maps'te Aç
            </a>
          )}
        </div>
      </section>

      {/* ③ Alt CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-12" style={{ background: "#1B3F84" }}>
        <div className="container-iscev flex flex-col sm:flex-row items-center
                        justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: "rgba(221,233,248,0.65)" }}>
              Proje Haritası
            </p>
            <h3 className="text-lg font-gilroy font-bold text-white">
              Tüm lokasyonları haritada görüntüleyin
            </h3>
          </div>
          <Link
            to="/dunya-haritasi"
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl
                       text-sm font-semibold bg-white transition-colors duration-200
                       hover:bg-[#DDE9F8]"
            style={{ color: "#1B3F84" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Dünya Haritası
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
