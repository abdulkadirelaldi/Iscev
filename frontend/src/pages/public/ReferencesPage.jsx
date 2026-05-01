import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { getReferences } from "../../api/reference.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Dummy veri — backend bağlanana kadar ────────────────────────────────── */
const DUMMY_REFS = [
  { _id: "1", name: "Petkim A.Ş.",          sector: "Petrokimya",     location: "İzmir, Türkiye",       logoPath: null },
  { _id: "2", name: "SABIC",                sector: "Kimya",          location: "Riyad, Suudi Arabistan", logoPath: null },
  { _id: "3", name: "SOCAR Turkey",         sector: "Enerji",         location: "İstanbul, Türkiye",    logoPath: null },
  { _id: "4", name: "Ereğli Demir Çelik",   sector: "Metal",          location: "Kdz. Ereğli, Türkiye", logoPath: null },
  { _id: "5", name: "Bosch Termoteknik",    sector: "Üretim",         location: "Manisa, Türkiye",      logoPath: null },
  { _id: "6", name: "Arar Group",           sector: "İnşaat",         location: "Doha, Katar",          logoPath: null },
  { _id: "7", name: "Cairo Water Authority",sector: "Altyapı",        location: "Kahire, Mısır",        logoPath: null },
  { _id: "8", name: "KazMunayGas",          sector: "Enerji",         location: "Astana, Kazakistan",   logoPath: null },
];

/* ─── Sector ikonları ─────────────────────────────────────────────────────── */
function SectorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

/* ─── Skeleton kart ───────────────────────────────────────────────────────── */
function RefSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-[#DDE9F8] p-6 animate-pulse">
      <div className="h-16 rounded-xl bg-gray-100 mb-5" />
      <div className="h-4 rounded-full bg-gray-200 w-3/4 mb-2" />
      <div className="h-3 rounded-full bg-gray-100 w-1/2 mb-1.5" />
      <div className="h-3 rounded-full bg-gray-100 w-2/3" />
    </div>
  );
}

/* ─── Referans kartı ──────────────────────────────────────────────────────── */
function ReferenceCard({ item, index }) {
  const cardRef = useRef(null);
  const inView  = useInView(cardRef, { once: true, margin: "-60px" });

  /* logoPath veya logo alanını destekle, her ikisi de yoksa null */
  const logoPath = item?.logoPath ?? item?.logo ?? null;
  const logoSrc  = logoPath ? `${UPLOADS_BASE}/${logoPath}` : null;
  const initial  = item?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <motion.div ref={cardRef}
      variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.45, delay: (index % 6) * 0.07, ease: "easeOut" }}
    >
      <div className="group flex flex-col items-center text-center rounded-2xl border border-[#DDE9F8]
                      bg-white p-6 hover:shadow-xl hover:-translate-y-1.5 hover:border-[#4988C5]
                      transition-all duration-300 h-full">
        {/* Logo / Avatar */}
        <div className="w-full h-20 flex items-center justify-center rounded-xl mb-5 overflow-hidden transition-colors duration-300"
          style={{ background: "#F4F9FF" }}>
          {logoSrc ? (
            <img src={logoSrc} alt={item?.name ?? ""}
              className="h-14 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <span className="text-3xl font-gilroy font-bold select-none"
              style={{ color: "#4988C5" }}>
              {initial}
            </span>
          )}
        </div>

        {/* İsim */}
        <h3 className="text-[14px] font-gilroy font-bold leading-snug mb-3 w-full"
          style={{ color: "#1B3F84" }}>
          {item?.name ?? "—"}
        </h3>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 w-full mt-auto">
          {item?.sector && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <span style={{ color: "#4988C5" }}><SectorIcon /></span>
              {item.sector}
            </div>
          )}
          {item?.location && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <span style={{ color: "#4988C5" }}><LocationIcon /></span>
              {item.location}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Logo Marquee ────────────────────────────────────────────────────────── */
function LogoMarquee({ refs }) {
  if (!refs || refs.length === 0) return null;

  const logoRefs = refs.filter((r) => r?.logoPath || r?.logo);
  const items    = logoRefs.length >= 4 ? logoRefs : refs;
  const doubled  = [...items, ...items];

  return (
    <div
      className="py-10 overflow-hidden border-y"
      style={{ background: "#fff", borderColor: "#DDE9F8" }}
    >
      <div className="flex items-center gap-4 mb-5 container-iscev">
        <p className="text-xs font-semibold tracking-widest uppercase shrink-0"
          style={{ color: "#4988C5" }}>
          Güvenilir Markalar
        </p>
        <div className="flex-1 h-px" style={{ background: "#DDE9F8" }} />
      </div>

      <div
        className="flex gap-8 w-max"
        style={{
          animation: "marquee 30s linear infinite",
        }}
      >
        {doubled.map((item, i) => {
          const logoPath = item?.logoPath ?? item?.logo ?? null;
          const logoSrc  = logoPath ? `${UPLOADS_BASE}/${logoPath}` : null;
          const initials = item?.name?.slice(0, 2)?.toUpperCase() ?? "??";

          return (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center
                         rounded-xl border border-[#DDE9F8] bg-white px-6"
              style={{ height: "64px", minWidth: "140px" }}
              title={item?.name}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={item?.name ?? ""}
                  className="h-8 w-auto max-w-[110px] object-contain opacity-70 hover:opacity-100
                             transition-opacity duration-200 grayscale hover:grayscale-0"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <span
                  className="text-sm font-gilroy font-bold select-none opacity-50"
                  style={{ color: "#1B3F84" }}
                >
                  {initials}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function ReferencesPage() {
  const [refs,       setRefs]       = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [activeSector, setActiveSector] = useState("ALL");

  useEffect(() => {
    getReferences({ isActive: true, limit: 200 })
      .then((res) => {
        const raw  = res?.data ?? res;
        const list = raw?.references ?? raw?.data ?? raw;
        setRefs(Array.isArray(list) ? list : DUMMY_REFS);
      })
      .catch(() => setRefs(DUMMY_REFS))
      .finally(() => setIsLoading(false));
  }, []);

  const sectors  = ["ALL", ...new Set(refs.map((r) => r.sector).filter(Boolean))];
  const filtered = activeSector === "ALL"
    ? refs
    : refs.filter((r) => r.sector === activeSector);

  return (
    <>
      <PageSEO
        title="Referanslar — Müşterilerimiz"
        description="İSÇEV'in Türkiye ve dünyadan 50'yi aşkın referans müşterisini keşfedin. Gıda, tekstil, kimya ve belediyecilik sektörlerinde başarılı projeler."
        canonical="/referanslar"
      />
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2552a3 60%, #1B3F84 100%)" }}>
        {/* Dekoratif elementler */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-[0.07] pointer-events-none"
          style={{ background: "#DDE9F8" }} />
        <div className="absolute -left-10 bottom-0 w-56 h-56 rounded-full opacity-[0.07] pointer-events-none"
          style={{ background: "#4988C5" }} />
        <div className="absolute right-1/4 top-1/3 w-32 h-32 rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: "#DDE9F8" }} />

        <div className="container-iscev relative z-10 py-16 sm:py-24">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-semibold tracking-[0.22em] uppercase mb-4"
            style={{ color: "#DDE9F8" }}>
            İş Ortaklarımız
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-gilroy font-bold text-white mb-5 leading-tight max-w-2xl">
            Küresel İş Ortaklarımız
            <br />
            <span style={{ color: "#DDE9F8" }}>ve Projelerimiz</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="text-sm sm:text-base max-w-lg leading-relaxed"
            style={{ color: "rgba(221,233,248,0.80)" }}>
            Petrokimyadan enerjiye, gıdadan tekstile kadar geniş bir sektör yelpazesinde,
            18'den fazla ülkedeki iş ortaklarımıza güvenilir su teknolojisi çözümleri sunuyoruz.
          </motion.p>

          {/* İstatistik bant */}
          {!isLoading && refs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className="flex flex-wrap gap-6 mt-10">
              {[
                { val: `${refs.length}+`, label: "Referans" },
                { val: `${sectors.length - 1}+`, label: "Farklı Sektör" },
                { val: "18+", label: "Ülke" },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-2xl font-gilroy font-bold text-white">{val}</span>
                  <span className="text-xs mt-0.5" style={{ color: "rgba(221,233,248,0.6)" }}>{label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Logo Marquee ──────────────────────────────────────────────────── */}
      {!isLoading && refs.length > 0 && <LogoMarquee refs={refs} />}

      {/* ── İçerik ────────────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev">

          {/* Sektör filtresi */}
          {!isLoading && sectors.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-10">
              {sectors.map((s) => (
                <button key={s} onClick={() => setActiveSector(s)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                  style={activeSector === s
                    ? { background: "#1B3F84", color: "#fff" }
                    : { background: "#DDE9F8", color: "#1B3F84" }}>
                  {s === "ALL" ? "Tümü" : s}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => <RefSkeleton key={i} />)
              : filtered.length === 0
                ? (
                  <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "#DDE9F8" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <p className="text-sm font-gilroy font-semibold" style={{ color: "#1B3F84" }}>
                      Bu sektörde referans bulunamadı.
                    </p>
                  </div>
                )
                : filtered.filter(Boolean).map((item, i) => (
                  <ReferenceCard key={item?._id ?? i} item={item} index={i} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── CTA bant ──────────────────────────────────────────────────────── */}
      <section className="py-14 border-t border-[#DDE9F8] bg-white">
        <div className="container-iscev">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55 }}
            className="rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center
                       justify-between gap-6 border border-[#DDE9F8]"
            style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-gilroy font-bold text-white mb-2">
                Referans Listemize Katılın
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(221,233,248,0.80)" }}>
                Yüzlerce global iş ortağına katılarak İSÇEV'in güvenilir çözümlerinden yararlanın.
              </p>
            </div>
            <a href="/iletisim"
              className="shrink-0 px-7 py-3 rounded-xl text-sm font-gilroy font-semibold
                         bg-white transition-all duration-200 hover:bg-[#DDE9F8]"
              style={{ color: "#1B3F84" }}>
              Proje Teklifi Alın
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
