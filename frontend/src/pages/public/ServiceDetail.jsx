import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getServiceBySlug } from "../../api/service.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const imgUrl = (path) => (path ? `${UPLOADS_BASE}/${path}` : null);

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse font-gilroy">
      <div className="w-full bg-gray-200" style={{ height: 420 }} />
      <div className="container-iscev py-12 space-y-4">
        <div className="h-4 bg-gray-100 rounded-full w-24" />
        <div className="h-8 bg-gray-200 rounded-full w-2/3" />
        <div className="space-y-3 mt-8">
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="h-3 bg-gray-100 rounded-full w-5/6" />
          <div className="h-3 bg-gray-100 rounded-full w-4/6" />
          <div className="h-3 bg-gray-100 rounded-full w-full mt-4" />
          <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        </div>
      </div>
    </div>
  );
}

/* ─── Hata ekranı ─────────────────────────────────────────────────────────── */
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
          Hizmet Bulunamadı
        </h2>
        <p className="text-sm text-gray-500">
          Aradığınız hizmet mevcut değil veya kaldırılmış olabilir.
        </p>
      </div>
      <button onClick={onBack}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "#1B3F84" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Hizmetlere Geri Dön
      </button>
    </div>
  );
}

/* ─── Ana bileşen ─────────────────────────────────────────────────────────── */
export default function ServiceDetail() {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  const [service,   setService]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const res  = await getServiceBySlug(slug);
      const data = res?.data?.service ?? res?.service ?? res?.data ?? res;
      if (!data?._id) throw new Error("empty");
      setService(data);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  /* ── Yükleniyor ──────────────────────────────────────────────────────────── */
  if (isLoading) return <Skeleton />;

  /* ── Bulunamadı ──────────────────────────────────────────────────────────── */
  if (notFound || !service) return <NotFound onBack={() => navigate("/hizmetler")} />;

  /* ── Veri hazırla ────────────────────────────────────────────────────────── */
  const coverSrc     = imgUrl(service.coverImagePath);
  const categoryName = service.category?.name ?? service.category ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="font-gilroy"
    >
      <PageSEO
        title={service.name}
        description={service.description}
        canonical={`/hizmetler/${service.slug}`}
        image={service.coverImagePath ? `/${service.coverImagePath}` : undefined}
      />
      {/* ① Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden"
        style={{ maxHeight: 420, minHeight: 280, background: "#0d1f42" }}>

        {coverSrc ? (
          <img
            src={coverSrc}
            alt={service.name}
            className="w-full object-cover"
            style={{ maxHeight: 420, width: "100%" }}
          />
        ) : (
          <div className="w-full" style={{
            height: 420,
            background: "linear-gradient(135deg, #1B3F84 0%, #0d1f42 100%)",
          }} />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, transparent 30%, rgba(27,63,132,0.70) 100%)",
        }} />

        {/* Başlık */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 sm:px-10 sm:py-10">
          <div className="container-iscev">
            {categoryName && (
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold
                               tracking-wide mb-3"
                style={{ background: "#DDE9F8", color: "#1B3F84" }}>
                {categoryName}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-gilroy font-bold
                           text-white leading-tight">
              {service.name}
            </h1>
          </div>
        </div>
      </div>

      {/* ② İçerik bölümü ──────────────────────────────────────────────────── */}
      <section className="py-12" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev max-w-3xl">
          {service.description && (
            <p className="text-[15px] leading-relaxed text-gray-600 mb-6">
              {service.description}
            </p>
          )}
          {service.content && (
            <div
              className="prose prose-sm max-w-none text-gray-700
                          prose-headings:font-gilroy prose-headings:text-[#1B3F84]
                          prose-a:text-[#4988C5] prose-strong:text-[#1B3F84]"
              dangerouslySetInnerHTML={{ __html: service.content }}
            />
          )}
        </div>
      </section>

      {/* ③ Alt CTA şeridi ────────────────────────────────────────────────── */}
      <section className="py-12" style={{ background: "#1B3F84" }}>
        <div className="container-iscev flex flex-col sm:flex-row items-center
                        justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: "rgba(221,233,248,0.65)" }}>
              Hizmetlerimiz
            </p>
            <h3 className="text-lg font-gilroy font-bold text-white">
              Diğer hizmetlerimizi inceleyin
            </h3>
          </div>
          <Link
            to="/hizmetler"
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl
                       text-sm font-semibold bg-white transition-colors duration-200
                       hover:bg-[#DDE9F8]"
            style={{ color: "#1B3F84" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Tüm Hizmetler
          </Link>
        </div>
      </section>

    </motion.div>
  );
}
