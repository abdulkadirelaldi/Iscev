import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getServices } from "../../api/service.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Dummy veri — backend bağlanana kadar ────────────────────────────────── */
const DUMMY_SERVICES = [
  {
    _id: "1", slug: "endustriyel-su-aritma",
    title: "Endüstriyel Su Arıtma",
    description: "Membran biyoreaktör ve ileri oksidasyon teknolojileriyle yüksek kapasiteli endüstriyel arıtma sistemleri.",
    category: "Arıtma Sistemleri", imageUrl: null,
  },
  {
    _id: "2", slug: "atik-su-geri-kazanim",
    title: "Atık Su Geri Kazanımı",
    description: "Sıfır atık hedefiyle tasarlanmış entegre geri kazanım tesisleri; kaynak verimliliği ve çevresel uyum.",
    category: "Geri Kazanım", imageUrl: null,
  },
  {
    _id: "3", slug: "anahtar-teslim-tesisler",
    title: "Anahtar Teslim Tesisler",
    description: "Proje tasarımından devreye almaya tek elden mühendislik, tedarik ve inşaat (EPC) hizmetleri.",
    category: "Mühendislik", imageUrl: null,
  },
  {
    _id: "4", slug: "bakim-teknik-destek",
    title: "Bakım & Teknik Destek",
    description: "Kurulum sonrası uzaktan izleme, periyodik bakım, yedek parça temini ve 7/24 acil müdahale.",
    category: "Destek", imageUrl: null,
  },
  {
    _id: "5", slug: "danismanlik-fizibilite",
    title: "Danışmanlık & Fizibilite",
    description: "Yatırım öncesi su analizi, proses tasarımı ve çevresel etki değerlendirme raporları.",
    category: "Danışmanlık", imageUrl: null,
  },
  {
    _id: "6", slug: "laboratuvar-analiz",
    title: "Laboratuvar & Analiz",
    description: "TSE ve ISO standartlarına uygun su kalite analizleri; proses optimizasyonu için sürekli izleme.",
    category: "Analiz", imageUrl: null,
  },
];

/* ─── Kategori filtre butonu ──────────────────────────────────────────────── */
function FilterBtn({ label, active, onClick }) {
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

/* ─── Skeleton kart ───────────────────────────────────────────────────────── */
function ServiceSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#DDE9F8] bg-white animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-6 space-y-3">
        <div className="h-3 rounded-full bg-gray-200 w-1/3" />
        <div className="h-4 rounded-full bg-gray-200 w-2/3" />
        <div className="h-3 rounded-full bg-gray-100 w-full" />
        <div className="h-3 rounded-full bg-gray-100 w-4/5" />
      </div>
    </div>
  );
}

/* ─── Hizmet kartı ────────────────────────────────────────────────────────── */
function ServiceCard({ service, index }) {
  const imgSrc = service.coverImagePath
    ? `${UPLOADS_BASE}/${service.coverImagePath}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        to={`/hizmetler/${service.slug}`}
        className="group flex flex-col rounded-2xl overflow-hidden border border-[#DDE9F8]
                   bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
      >
        {/* Görsel */}
        <div className="relative h-48 overflow-hidden shrink-0" style={{ background: "#DDE9F8" }}>
          {imgSrc ? (
            <img src={imgSrc} alt={service.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 opacity-50">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12a15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          )}
          {/* Kategori rozeti */}
          {service.category && (
            <span
              className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(27,63,132,0.85)", color: "#DDE9F8" }}
            >
              {service.category?.name ?? service.category}
            </span>
          )}
          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(27,63,132,0.55) 0%, transparent 60%)" }}
          />
        </div>

        {/* İçerik */}
        <div className="flex flex-col flex-1 p-6 gap-3">
          <h3 className="text-[15px] font-bold font-gilroy leading-snug" style={{ color: "#1B3F84" }}>
            {service.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed flex-1">
            {service.description}
          </p>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold mt-1
                       group-hover:gap-2.5 transition-all duration-200"
            style={{ color: "#4988C5" }}
          >
            Detayları İncele
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function ServicesPage() {
  const [services,    setServices]    = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [activeCategory, setActiveCat] = useState("ALL");

  useEffect(() => {
    getServices()
      .then((res) => {
        const raw  = res?.data ?? res;
        const list = raw?.services ?? raw?.data ?? raw;
        setServices(Array.isArray(list) ? list : DUMMY_SERVICES);
      })
      .catch(() => setServices(DUMMY_SERVICES))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ["ALL", ...new Set(services.map((s) => s.category?.name ?? s.category).filter(Boolean))];
  const filtered   = activeCategory === "ALL"
    ? services
    : services.filter((s) => (s.category?.name ?? s.category) === activeCategory);

  return (
    <>
      <PageSEO
        title="Hizmetler — Mühendislik Çözümleri"
        description="Endüstriyel su arıtma, atık su geri kazanımı, anahtar teslim tesisler ve teknik destek hizmetlerimizi keşfedin. İSÇEV ile çevre dostu çözümler."
        canonical="/hizmetler"
      />
      {/* ── Hero-mini ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}
      >
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: "#DDE9F8" }} />
        <div className="absolute -left-10 bottom-0 w-44 h-44 rounded-full opacity-10 pointer-events-none"
          style={{ background: "#4988C5" }} />

        <div className="container-iscev relative z-10 py-14 sm:py-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#DDE9F8" }}>
            Çözümlerimiz
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-gilroy font-bold text-white mb-4 leading-tight">
            Hizmetlerimiz
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="text-sm max-w-lg leading-relaxed"
            style={{ color: "rgba(221,233,248,0.8)" }}>
            Endüstriyel su arıtmadan anahtar teslim tesis kurulumuna kadar geniş
            hizmet yelpazemizi keşfedin.
          </motion.p>
        </div>
      </section>

      {/* ── İçerik ─────────────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev">

          {/* Kategori filtresi */}
          {!isLoading && categories.length > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 mb-8">
              {categories.map((c) => (
                <FilterBtn key={c}
                  label={c === "ALL" ? "Tümü" : c}
                  active={activeCategory === c}
                  onClick={() => setActiveCat(c)} />
              ))}
            </motion.div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
              : filtered.map((s, i) => <ServiceCard key={s._id} service={s} index={i} />)
            }
          </div>
        </div>
      </section>
    </>
  );
}
