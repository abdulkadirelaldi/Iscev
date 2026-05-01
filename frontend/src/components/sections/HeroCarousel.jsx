import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Fallback slide verisi (API boş / hata durumunda) ────────────────────── */
const FALLBACK_SLIDES = [
  {
    id:       "fallback-1",
    imageUrl: null,
    title:    "Endüstriyel Su Arıtma'da\nGlobal Güç",
    subtitle: "İleri membran teknolojileri ile su kaynaklarınızı koruyoruz.",
    ctaText:  "Hizmetlerimizi İnceleyin",
    ctaLink:  "/hizmetler",
  },
  {
    id:       "fallback-2",
    imageUrl: null,
    title:    "Çevreye Saygılı\nÜretim Çözümleri",
    subtitle: "Sıfır atık hedefiyle tasarlanmış entegre arıtma sistemleri.",
    ctaText:  "Hizmetlerimizi İnceleyin",
    ctaLink:  "/hizmetler",
  },
  {
    id:       "fallback-3",
    imageUrl: null,
    title:    "Dünya Genelinde\n50+ Tamamlanan Proje",
    subtitle: "Türkiye'den Orta Doğu'ya, Afrika'dan Avrupa'ya uzanan referanslarımız.",
    ctaText:  "Hizmetlerimizi İnceleyin",
    ctaLink:  "/hizmetler",
  },
];

/* ─── API carousel → normalize ────────────────────────────────────────────── */
function normalizeSlides(raw) {
  const list = raw?.data?.carousel ?? raw?.carousel ?? raw?.data?.settings?.carousel ?? [];
  if (!Array.isArray(list) || list.length === 0) return null;

  const active = list
    .filter((s) => s?.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (active.length === 0) return null;

  return active.map((s) => ({
    id:       s._id ?? s.id,
    imageUrl: s.backgroundImage
      ? (s.backgroundImage.startsWith("http") ? s.backgroundImage : `${UPLOADS_BASE}/${s.backgroundImage}`)
      : s.imagePath
        ? `${UPLOADS_BASE}/${s.imagePath}`
        : null,
    title:    s.title    ?? "",
    subtitle: s.subtitle ?? "",
    ctaText:  s.ctaText  ?? "Hizmetlerimizi İnceleyin",
    ctaLink:  s.ctaLink  ?? "/hizmetler",
  }));
}

/* ─── Slide geçiş varyantları ─────────────────────────────────────────────── */
const slideVariants = {
  enter: (direction) => ({
    x:       direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x:       0,
    opacity: 1,
    transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (direction) => ({
    x:       direction > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const textVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" },
  }),
};

/* ─── Ok ikonu ────────────────────────────────────────────────────────────── */
function ChevronIcon({ direction = "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      {direction === "right"
        ? <polyline points="9 18 15 12 9 6" />
        : <polyline points="15 18 9 12 15 6" />}
    </svg>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────────────────────────────── */
export default function HeroCarousel({ interval = 5000 }) {
  const [[activeIndex, direction], setPage] = useState([0, 0]);
  const [isPaused,  setIsPaused]  = useState(false);
  const [slides,    setSlides]    = useState(FALLBACK_SLIDES);
  const [fetching,  setFetching]  = useState(true);

  /* ── API'den slaytları çek ───────────────────────────────────────────── */
  useEffect(() => {
    api.get("/site-settings")
      .then((r) => {
        const normalized = normalizeSlides(r?.data);
        if (normalized) setSlides(normalized);
      })
      .catch(() => { /* fallback slides zaten yüklü */ })
      .finally(() => setFetching(false));
  }, []);

  const total = slides.length;

  const paginate = useCallback(
    (newDirection) => {
      setPage(([current]) => [
        (current + newDirection + total) % total,
        newDirection,
      ]);
    },
    [total]
  );

  /* ── Otomatik geçiş ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => paginate(1), interval);
    return () => clearInterval(timer);
  }, [isPaused, paginate, interval, total]);

  const goTo = (index) => {
    setPage(([current]) => [index, index > current ? 1 : -1]);
  };

  const activeSlide = slides[activeIndex];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0d1f42]"
      style={{ height: "100svh", minHeight: "560px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Ana Sayfa Hero Carousel"
    >
      {/* ── Skeleton (ilk yükleme) ───────────────────────────────────────── */}
      {fetching && (
        <div className="absolute inset-0 z-30 animate-pulse"
          style={{ background: "linear-gradient(135deg, #1B3F84 0%, #0d1f42 100%)" }} />
      )}

      {/* ── Arka Plan Görselleri ─────────────────────────────────────────── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Görsel — yoksa Derin Mavi fallback arka plan */}
          {activeSlide.imageUrl ? (
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full"
              style={{ background: "linear-gradient(135deg, #1B3F84 0%, #0d1f42 100%)" }} />
          )}
          {/* Koyu gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(27,63,132,0.82) 0%, rgba(27,63,132,0.45) 55%, rgba(0,0,0,0.1) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── İçerik Katmanı ──────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-iscev w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="max-w-2xl"
            >
              {/* Üst etiket */}
              <motion.span
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-block text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "#DDE9F8" }}
              >
                İSÇEV Arıtma & Çevre Teknolojileri
              </motion.span>

              {/* Ana başlık */}
              <motion.h1
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0.15}
                className="text-4xl sm:text-5xl lg:text-6xl font-gilroy font-bold text-white leading-tight mb-5 whitespace-pre-line"
              >
                {activeSlide.title}
              </motion.h1>

              {/* Alt başlık */}
              <motion.p
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="text-base sm:text-lg font-medium mb-8 max-w-lg leading-relaxed"
                style={{ color: "#DDE9F8" }}
              >
                {activeSlide.subtitle}
              </motion.p>

              {/* CTA Butonları */}
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate="visible"
                custom={0.45}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to={activeSlide.ctaLink || "/hizmetler"}
                  className="
                    btn-primary
                    text-sm px-7 py-3.5 rounded-xl
                    shadow-lg shadow-[#1B3F84]/40
                  "
                >
                  {activeSlide.ctaText || "Hizmetlerimizi İnceleyin"}
                </Link>
                <Link
                  to="/iletisim"
                  className="
                    inline-flex items-center justify-center gap-2
                    text-white border-2 border-white/60 hover:border-white
                    text-sm font-semibold px-7 py-3.5 rounded-xl
                    backdrop-blur-sm hover:bg-white/10
                    transition-all duration-200
                  "
                >
                  İletişime Geçin
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Önceki / Sonraki Butonları ───────────────────────────────────── */}
      {total > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            aria-label="Önceki slayt"
            className="
              absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20
              w-11 h-11 rounded-full
              flex items-center justify-center
              bg-white/10 hover:bg-white/25 border border-white/20
              text-white backdrop-blur-sm
              transition-all duration-200
            "
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            onClick={() => paginate(1)}
            aria-label="Sonraki slayt"
            className="
              absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20
              w-11 h-11 rounded-full
              flex items-center justify-center
              bg-white/10 hover:bg-white/25 border border-white/20
              text-white backdrop-blur-sm
              transition-all duration-200
            "
          >
            <ChevronIcon direction="right" />
          </button>
        </>
      )}

      {/* ── Alt Dots & İlerleme ──────────────────────────────────────────── */}
      {total > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slayt ${i + 1}`}
              className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
              style={{
                width:      i === activeIndex ? "32px" : "12px",
                background: "rgba(255,255,255,0.3)",
              }}
            >
              {i === activeIndex && (
                <motion.span
                  key={activeIndex}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "#DDE9F8" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: interval / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Scroll aşağı ipucu ───────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span
          className="text-[10px] font-medium tracking-widest uppercase rotate-90"
          style={{ color: "rgba(221,233,248,0.6)" }}
        >
          Kaydır
        </span>
        <motion.div
          className="w-px h-10 origin-top"
          style={{ background: "rgba(221,233,248,0.4)" }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
