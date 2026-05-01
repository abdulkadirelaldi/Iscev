import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug } from "../../api/product.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const imgUrl = (path) => (path ? `${UPLOADS_BASE}/${path}` : null);

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse font-gilroy">
      <div className="w-full bg-gray-200" style={{ height: 420 }} />
      <div className="container-iscev py-12 space-y-6">
        <div className="h-4 bg-gray-100 rounded-full w-24" />
        <div className="h-8 bg-gray-200 rounded-full w-2/3" />
        <div className="flex gap-8 mt-8">
          <div className="flex-1 space-y-3">
            <div className="h-3 bg-gray-100 rounded-full w-full" />
            <div className="h-3 bg-gray-100 rounded-full w-5/6" />
            <div className="h-3 bg-gray-100 rounded-full w-4/6" />
            <div className="h-3 bg-gray-100 rounded-full w-full mt-6" />
            <div className="h-3 bg-gray-100 rounded-full w-3/4" />
          </div>
          <div className="w-72 shrink-0 hidden lg:block">
            <div className="rounded-2xl bg-gray-100 h-48" />
          </div>
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
          Ürün Bulunamadı
        </h2>
        <p className="text-sm text-gray-500">
          Aradığınız ürün mevcut değil veya kaldırılmış olabilir.
        </p>
      </div>
      <button onClick={onBack}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "#1B3F84" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Ürünlere Geri Dön
      </button>
    </div>
  );
}

/* ─── Galeri modalı ───────────────────────────────────────────────────────── */
function GalleryModal({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{    scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="relative max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={src} alt={alt}
            className="w-full max-h-[85vh] object-contain rounded-2xl" />
          <button onClick={onClose}
            className="absolute -top-4 -right-4 w-9 h-9 rounded-full flex items-center
                       justify-center text-white bg-white/20 hover:bg-white/35 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Ana bileşen ─────────────────────────────────────────────────────────── */
export default function ProductDetail() {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  const [product,   setProduct]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [lightbox,  setLightbox]  = useState(null); // { src, alt }

  const load = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const res  = await getProductBySlug(slug);
      const data = res?.data?.product ?? res?.product ?? res?.data ?? res;
      if (!data?._id) throw new Error("empty");
      setProduct(data);
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
  if (notFound || !product) return <NotFound onBack={() => navigate("/urunler")} />;

  /* ── Veri hazırla ────────────────────────────────────────────────────────── */
  const coverSrc     = imgUrl(product.coverImagePath);
  const categoryName = product.category?.name ?? product.category ?? null;
  const gallery      = Array.isArray(product.galleryImagePaths) ? product.galleryImagePaths : [];

  /* technicalSpecs: Map (mongoose) veya düz obje */
  const specsRaw   = product.technicalSpecs;
  const specsObj   = specsRaw instanceof Map
    ? Object.fromEntries(specsRaw)
    : (specsRaw && typeof specsRaw === "object" ? specsRaw : null);
  const specEntries = specsObj
    ? Object.entries(specsObj).filter(([, v]) => v !== "" && v != null)
    : [];

  return (
    <>
      <PageSEO
        title={product.name}
        description={product.description}
        canonical={`/urunler/${product.slug}`}
        image={product.coverImagePath ? `/${product.coverImagePath}` : undefined}
        type="product"
      />
      {/* ── Galeri modalı ─────────────────────────────────────────────────── */}
      {lightbox && (
        <GalleryModal
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="font-gilroy"
      >
        {/* ① Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden"
          style={{ maxHeight: 420, minHeight: 280, background: "#0d1f42" }}>

          {coverSrc ? (
            <img
              src={coverSrc}
              alt={product.name}
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
                {product.name}
              </h1>
            </div>
          </div>
        </div>

        {/* ② İçerik bölümü ────────────────────────────────────────────────── */}
        <section className="py-12" style={{ background: "#F8FBFF" }}>
          <div className="container-iscev">
            <div className="flex flex-col lg:flex-row gap-10">

              {/* Sol: Açıklama + HTML içerik */}
              <div className="flex-1 min-w-0">
                {product.description && (
                  <p className="text-[15px] leading-relaxed text-gray-600 mb-6">
                    {product.description}
                  </p>
                )}
                {product.content && (
                  <div
                    className="prose prose-sm max-w-none text-gray-700
                                prose-headings:font-gilroy prose-headings:text-[#1B3F84]
                                prose-a:text-[#4988C5] prose-strong:text-[#1B3F84]"
                    dangerouslySetInnerHTML={{ __html: product.content }}
                  />
                )}
              </div>

              {/* Sağ: Teknik Özellikler */}
              {specEntries.length > 0 && (
                <div className="lg:w-80 shrink-0">
                  <div className="rounded-2xl border border-[#DDE9F8] p-5"
                    style={{ background: "#ffffff" }}>
                    {/* Kart başlık */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DDE9F8]">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "#DDE9F8" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <line x1="8"  y1="6"  x2="21" y2="6"  />
                          <line x1="8"  y1="12" x2="21" y2="12" />
                          <line x1="8"  y1="18" x2="21" y2="18" />
                          <line x1="3"  y1="6"  x2="3.01" y2="6"  />
                          <line x1="3"  y1="12" x2="3.01" y2="12" />
                          <line x1="3"  y1="18" x2="3.01" y2="18" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold" style={{ color: "#1B3F84" }}>
                        Teknik Özellikler
                      </h3>
                    </div>

                    <table className="w-full text-xs border-collapse">
                      <tbody>
                        {specEntries.map(([key, value], i) => (
                          <tr key={key}
                            style={{ borderBottom: i < specEntries.length - 1 ? "1px solid #EBF2FF" : "none" }}>
                            <td className="py-2.5 pr-3 font-semibold align-top w-2/5"
                              style={{ color: "#1B3F84" }}>
                              {key}
                            </td>
                            <td className="py-2.5 text-gray-700 align-top">
                              {String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ③ Galeri ──────────────────────────────────────────────────────── */}
        {gallery.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container-iscev">
              <h2 className="text-lg font-bold mb-6" style={{ color: "#1B3F84" }}>
                Ürün Görselleri
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.filter(Boolean).map((path, i) => {
                  const src = imgUrl(path);
                  if (!src) return null;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.18 }}
                      className="relative rounded-xl overflow-hidden cursor-pointer"
                      style={{ aspectRatio: "1 / 1" }}
                      onClick={() => setLightbox({ src, alt: `${product.name} — Görsel ${i + 1}` })}
                    >
                      <img src={src} alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover" />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center
                                      opacity-0 hover:opacity-100 transition-opacity duration-200"
                        style={{ background: "rgba(27,63,132,0.45)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8"  x2="11" y2="14" />
                          <line x1="8"  y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ④ Alt CTA şeridi ──────────────────────────────────────────────── */}
        <section className="py-12" style={{ background: "#1B3F84" }}>
          <div className="container-iscev flex flex-col sm:flex-row items-center
                          justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: "rgba(221,233,248,0.65)" }}>
                Ürün Kataloğu
              </p>
              <h3 className="text-lg font-gilroy font-bold text-white">
                Daha fazla ürün inceleyin
              </h3>
            </div>
            <Link
              to="/urunler"
              className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl
                         text-sm font-semibold bg-white transition-colors duration-200
                         hover:bg-[#DDE9F8]"
              style={{ color: "#1B3F84" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Tüm Ürünler
            </Link>
          </div>
        </section>

      </motion.div>
    </>
  );
}
