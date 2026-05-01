import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import CatalogCard from "../../components/cards/CatalogCard";
import { getCatalogs } from "../../api/catalog.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Skeleton kart ───────────────────────────────────────────────────────── */
function CatalogSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#DDE9F8] bg-[#F4F9FF] animate-pulse">
      {/* Üst mavi band */}
      <div className="h-[112px]" style={{ background: "#C8D8EE" }} />
      {/* İçerik */}
      <div className="px-5 py-4 space-y-3">
        <div className="h-3.5 rounded-full bg-gray-200 w-4/5" />
        <div className="h-3 rounded-full bg-gray-100 w-2/5" />
      </div>
      {/* Buton alanı */}
      <div className="grid grid-cols-2 divide-x divide-[#DDE9F8] border-t border-[#DDE9F8]">
        <div className="h-10" />
        <div className="h-10" />
      </div>
    </div>
  );
}

/* ─── Boş durum ───────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#DDE9F8" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
      </div>
      <div>
        <p className="font-gilroy font-semibold text-sm" style={{ color: "#1B3F84" }}>
          Henüz katalog eklenmemiş
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Yakında yeni kataloglar yayınlanacak.
        </p>
      </div>
    </div>
  );
}

/* ─── Animasyon varyantları ───────────────────────────────────────────────── */
const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariant = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: "easeOut" } },
};

/* ─── Dil filtre butonu ───────────────────────────────────────────────────── */
function LangFilter({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
      style={
        active
          ? { background: "#1B3F84", color: "#fff" }
          : { background: "#DDE9F8", color: "#1B3F84" }
      }
    >
      {label}
    </button>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function CatalogsPage() {
  const [catalogs,  setCatalogs]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLang, setActiveLang] = useState("ALL");

  useEffect(() => {
    getCatalogs()
      .then((res) => {
        const raw  = res?.data ?? res;
        const list = raw?.catalogs ?? raw?.data ?? raw;
        setCatalogs(Array.isArray(list) ? list : []);
      })
      .catch(() => setCatalogs([]))
      .finally(() => setIsLoading(false));
  }, []);

  /* ── Dil filtresi ─────────────────────────────────────────────────────── */
  const langs = ["ALL", ...new Set(catalogs.map((c) => c.language).filter(Boolean))];
  const filtered =
    activeLang === "ALL"
      ? catalogs
      : catalogs.filter((c) => c.language === activeLang);

  return (
    <>
      <PageSEO
        title="Kataloglar — PDF İndirme"
        description="İSÇEV ürün ve hizmet kataloglarını Türkçe ve İngilizce olarak indirin. Teknik belgelerimize buradan ulaşın."
        canonical="/kataloglar"
      />
      {/* ── Hero-mini başlık ────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}
      >
        {/* Dekoratif daireler */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: "#DDE9F8" }}
        />
        <div
          className="absolute -left-8 bottom-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
          style={{ background: "#4988C5" }}
        />

        <div className="container-iscev relative z-10 py-14 sm:py-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#DDE9F8" }}
          >
            Doküman Merkezi
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-gilroy font-bold text-white mb-4 leading-tight"
          >
            İSÇEV Kurumsal Katalog
            <br className="hidden sm:block" /> ve Broşürleri
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm max-w-lg leading-relaxed"
            style={{ color: "rgba(221,233,248,0.8)" }}
          >
            Ürün kataloglarımızı, teknik broşürlerimizi ve kurumsal dokümanlarımızı
            doğrudan görüntüleyebilir veya cihazınıza indirebilirsiniz.
          </motion.p>

          {/* İstatistik band */}
          {!isLoading && catalogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-2 mt-7"
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.12)", color: "#DDE9F8" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {catalogs.length} Doküman
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── İçerik ──────────────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev">

          {/* Dil filtre çubuğu — birden fazla dil varsa göster */}
          {!isLoading && langs.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {langs.map((l) => (
                <LangFilter
                  key={l}
                  label={l === "ALL" ? "Tümü" : l}
                  active={activeLang === l}
                  onClick={() => setActiveLang(l)}
                />
              ))}
            </motion.div>
          )}

          {/* Grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <CatalogSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((catalog) => (
                <motion.div key={catalog._id} variants={cardVariant}>
                  <CatalogCard
                    title={catalog.name}
                    pdfUrl={`${UPLOADS_BASE}/${catalog.pdfFilePath}`}
                    date={catalog.createdAt}
                    lang={catalog.language}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Alt CTA ─────────────────────────────────────────────────────── */}
      {!isLoading && catalogs.length > 0 && (
        <section className="py-12 bg-white border-t border-[#DDE9F8]">
          <div className="container-iscev text-center">
            <p className="text-sm text-gray-500 mb-4">
              Aradığınız dokümanı bulamadınız mı?
            </p>
            <a
              href="/iletisim"
              className="inline-flex items-center gap-2 text-sm font-semibold
                         transition-colors duration-150"
              style={{ color: "#1B3F84" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4988C5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#1B3F84")}
            >
              Teknik ekibimizle iletişime geçin
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>
        </section>
      )}
    </>
  );
}
