import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

import HeroCarousel from "../../components/sections/HeroCarousel";
import WorldMap from "../../components/map/WorldMap";
import api from "../../api/axiosInstance";
import { getServices } from "../../api/service.api";
import PageSEO from "../../components/common/PageSEO";

/* ─── Animasyon varyantları ───────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

/* ─── InView tetikleyici wrapper ──────────────────────────────────────────── */
function RevealSection({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Kurumsal bölüm varsayılan değerleri ─────────────────────────────────── */
const DEFAULT_CORPORATE = {
  subtitle: "Kurumsal Vizyonumuz",
  title:    "Su Kaynaklarını Geleceğe\nTaşıyan Teknoloji",
  bodyText: "1999'dan bu yana endüstriyel su arıtma ve çevre teknolojileri alanında Türkiye'nin öncü firmalarından biri olarak, 18'den fazla ülkede 50'yi aşkın tesis kurarak küresel bir güce dönüştük. İleri mühendislik çözümlerimizle su verimliliğini en üst düzeye taşıyoruz.",
  stats: [
    { value: "50+", label: "Tamamlanan Proje" },
    { value: "18+", label: "Ülkede Varlık" },
    { value: "25+", label: "Yıllık Deneyim" },
    { value: "%99", label: "Müşteri Memnuniyeti" },
  ],
};

/* ─── Hizmet Kartı ────────────────────────────────────────────────────────── */
function ServiceCard({ service, index }) {
  const href = service.slug ? `/hizmetler/${service.slug}` : "/hizmetler";
  return (
    <motion.div variants={fadeUp} custom={index} className="h-full">
      <Link
        to={href}
        className="
          group flex flex-col gap-4 p-6 rounded-2xl h-full
          bg-white border border-[#DDE9F8]
          hover:shadow-lg hover:-translate-y-1
          transition-all duration-300
        "
      >
        {service.coverImagePath ? (
          <img
            src={`${UPLOADS_BASE}/${service.coverImagePath}`}
            alt={service.name}
            className="w-14 h-14 rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0
                       group-hover:bg-[#1B3F84] group-hover:text-white
                       transition-colors duration-300"
            style={{ background: "#DDE9F8", color: "#1B3F84" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-[15px] font-bold mb-2 font-gilroy" style={{ color: "#1B3F84" }}>
            {service.name}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
        </div>
        <span
          className="text-xs font-semibold flex items-center gap-1
                     group-hover:gap-2 transition-all duration-200"
          style={{ color: "#4988C5" }}
        >
          Detaylı İncele
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </Link>
    </motion.div>
  );
}

/* ─── Kurumsal Bölüm Skeleton ─────────────────────────────────────────────── */
function CorporateSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center animate-pulse">
      {/* Sol: metin skeleton */}
      <div className="space-y-4">
        <div className="h-3 w-32 bg-gray-200 rounded-full" />
        <div className="h-6 w-64 bg-gray-200 rounded-full" />
        <div className="h-4 w-48 bg-gray-100 rounded-full" />
        <div className="space-y-2 mt-2">
          <div className="h-3 w-full bg-gray-100 rounded-full" />
          <div className="h-3 w-5/6 bg-gray-100 rounded-full" />
          <div className="h-3 w-4/6 bg-gray-100 rounded-full" />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-28 bg-gray-200 rounded-xl" />
          <div className="h-10 w-36 bg-gray-100 rounded-xl" />
        </div>
      </div>
      {/* Sağ: stat grid skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-6"
            style={{ background: i % 2 === 0 ? "#e5eaf2" : "#EFF5FC" }}>
            <div className="h-8 w-16 rounded-lg bg-gray-300 mb-2 mx-auto" />
            <div className="h-3 w-20 rounded-full bg-gray-200 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [corporate,    setCorporate]    = useState(DEFAULT_CORPORATE);
  const [corpLoading,  setCorpLoading]  = useState(true);
  const [services,     setServices]     = useState([]);
  const [svcLoading,   setSvcLoading]   = useState(true);

  useEffect(() => {
    getServices({ isActive: true, limit: 8 })
      .then((res) => {
        const raw  = res?.data ?? res;
        const list = raw?.services ?? raw?.data ?? raw;
        setServices(Array.isArray(list) ? list.slice(0, 4) : []);
      })
      .catch(() => setServices([]))
      .finally(() => setSvcLoading(false));
  }, []);

  useEffect(() => {
    api.get("/site-settings")
      .then((r) => {
        const raw  = r?.data ?? r;
        const corp = raw?.data?.corporateSection ?? raw?.corporateSection ?? null;
        if (!corp) return;

        const rawStats = Array.isArray(corp.stats) && corp.stats.length > 0
          ? corp.stats
          : DEFAULT_CORPORATE.stats;

        setCorporate({
          subtitle: corp.subtitle || DEFAULT_CORPORATE.subtitle,
          title:    corp.title    || DEFAULT_CORPORATE.title,
          bodyText: corp.bodyText || DEFAULT_CORPORATE.bodyText,
          stats:    rawStats,
        });
      })
      .catch(() => { /* varsayılan değerler kalır */ })
      .finally(() => setCorpLoading(false));
  }, []);

  return (
    <>
      <PageSEO
        title="Endüstriyel Su Arıtma Çözümleri"
        description="İSÇEV — 25 yıllık deneyimle endüstriyel su arıtma, atık su geri kazanımı ve çevre teknolojileri alanında Türkiye'nin lider firması. 18'den fazla ülkede 50+ tamamlanan proje."
        canonical="/"
      />
      {/* ① Hero Carousel ──────────────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ② Vizyon / Kurumsal Bant ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-iscev">
          {corpLoading ? (
            <CorporateSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

              {/* Sol: Metin bloku */}
              <RevealSection>
                <motion.p variants={fadeUp} custom={0} className="section-subtitle mb-3">
                  {corporate.subtitle}
                </motion.p>
                <motion.h2 variants={fadeUp} custom={1} className="section-title mb-5">
                  {corporate.title.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < corporate.title.split("\n").length - 1 && <br />}</span>
                  ))}
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  custom={2}
                  className="text-gray-500 text-[15px] leading-relaxed mb-7 max-w-lg"
                >
                  {corporate.bodyText}
                </motion.p>
                <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
                  <Link to="/kurumsal" className="btn-primary text-sm">
                    Hakkımızda
                  </Link>
                  <Link to="/urunler" className="btn-secondary text-sm">
                    Projelerimizi Keşfet
                  </Link>
                </motion.div>
              </RevealSection>

              {/* Sağ: İstatistik grid */}
              <RevealSection>
                <div className="grid grid-cols-2 gap-4">
                  {(corporate.stats ?? []).map(({ value, label }, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      custom={i * 0.1}
                      className="rounded-2xl p-6 text-center"
                      style={{ background: i % 2 === 0 ? "#1B3F84" : "#DDE9F8" }}
                    >
                      <p
                        className="text-3xl font-bold mb-1 font-gilroy"
                        style={{ color: i % 2 === 0 ? "#DDE9F8" : "#1B3F84" }}
                      >
                        {value}
                      </p>
                      <p
                        className="text-xs font-medium"
                        style={{ color: i % 2 === 0 ? "rgba(221,233,248,0.75)" : "#4988C5" }}
                      >
                        {label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </RevealSection>
            </div>
          )}
        </div>
      </section>

      {/* ③ Öne Çıkan Hizmetler ────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#F4F9FF" }}>
        <div className="container-iscev">
          <RevealSection className="text-center mb-12">
            <motion.p variants={fadeUp} custom={0} className="section-subtitle mb-2">
              Ne Yapıyoruz?
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="section-title">
              Hizmetlerimiz
            </motion.h2>
          </RevealSection>

          <RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {svcLoading
                ? [0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
                  ))
                : services.map((s, i) => (
                    <ServiceCard key={s._id} service={s} index={i} />
                  ))
              }
            </div>
          </RevealSection>

          <RevealSection className="text-center mt-10">
            <motion.div variants={fadeUp} custom={0}>
              <Link to="/hizmetler" className="btn-secondary text-sm">
                Tüm Hizmetleri İncele
              </Link>
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* ④ Küresel Etki Alanı — Dünya Haritası ──────────────────────────────── */}
      <section
        className="py-0 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #F4F9FF 0%, #EBF2FF 100%)" }}
      >
        <div className="container-iscev pt-16 pb-2 text-center">
          <RevealSection>
            <motion.p variants={fadeUp} custom={0} className="section-subtitle mb-2">
              Küresel Varlığımız
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mb-4">
              Faaliyet Gösterdiğimiz Lokasyonlar
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto"
            >
              18'den fazla ülkede kurduğumuz tesisleri harita üzerinde keşfedin.
              Pin'lere tıklayarak proje detaylarına ulaşabilirsiniz.
            </motion.p>
          </RevealSection>
        </div>
        <div className="w-full">
          <WorldMap hideHeading />
        </div>
      </section>

      {/* ⑤ CTA Bandı ─────────────────────────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}
      >
        <div className="container-iscev text-center">
          <RevealSection>
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl font-gilroy font-bold text-white mb-4"
            >
              Projeniz İçin Uzmanlarımızla Görüşün
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-sm mb-8 max-w-md mx-auto"
              style={{ color: "rgba(221,233,248,0.8)" }}
            >
              Ekibimiz ihtiyaçlarınızı analiz ederek size özel mühendislik çözümleri sunar.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                to="/iletisim"
                className="
                  inline-flex items-center gap-2 bg-white font-semibold text-sm
                  px-7 py-3.5 rounded-xl shadow-lg
                  hover:bg-[#DDE9F8] transition-colors duration-200
                "
                style={{ color: "#1B3F84" }}
              >
                Teklif Alın
              </Link>
              <Link
                to="/kataloglar"
                className="
                  inline-flex items-center gap-2 border-2 border-white/50
                  text-white font-semibold text-sm px-7 py-3.5 rounded-xl
                  hover:bg-white/10 hover:border-white transition-all duration-200
                "
              >
                Katalogları İncele
              </Link>
            </motion.div>
          </RevealSection>
        </div>
      </section>
    </>
  );
}
