import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { getCorporate } from "../../api/corporate.api";
import api from "../../api/axiosInstance";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Animasyon yardımcıları ──────────────────────────────────────────────── */
function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 32 : direction === "down" ? -32 : 0,
      x: direction === "left" ? 32 : direction === "right" ? -32 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, delay, ease: "easeOut" } },
  };
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "visible" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Varsayılan fallback verileri ────────────────────────────────────────── */
const DEFAULT_HERO_STATS = [
  { val: "1998", label: "Kuruluş Yılı" },
  { val: "18+",  label: "Ülke" },
  { val: "300+", label: "Tamamlanan Proje" },
  { val: "25+",  label: "Yıllık Deneyim" },
];

const DEFAULT_VALUES = [
  { icon: "💡", title: "İnovasyon",        desc: "Membran biyoreaktör, ileri oksidasyon ve dijital izleme sistemleriyle sektörün teknoloji sınırlarını zorluyoruz." },
  { icon: "🌱", title: "Sürdürülebilirlik", desc: "Sıfır atık hedefiyle tasarlanan tesislerimiz, çevresel etkiyi minimize ederken enerji verimliliğini maksimize eder." },
  { icon: "🤝", title: "Müşteri Odaklılık", desc: "Proje tasarımından devreye almaya, devreye almadan 7/24 teknik desteğe uzanan bütünleşik hizmet anlayışı." },
  { icon: "🌐", title: "Küresel Güven",    desc: "ISO 9001, ISO 14001 ve TSE belgeli kalite sistemi ile 18 ülkedeki müşterilerimizin güvenini kazanıyoruz." },
];

const DEFAULT_MILESTONES = [
  { icon: "🏛️", year: "1998", title: "Kuruluş",                    desc: "İSÇEV, İstanbul'da endüstriyel su arıtma teknolojilerine odaklanan bir mühendislik şirketi olarak kuruldu." },
  { icon: "🏭", year: "2003", title: "İlk Büyük Endüstriyel Proje", desc: "Türkiye'nin önde gelen tekstil fabrikalarından birine 5.000 m³/gün kapasiteli MBR arıtma tesisi kurulumu tamamlandı." },
  { icon: "🌍", year: "2009", title: "Uluslararası Açılım",         desc: "İlk uluslararası proje Körfez bölgesinde hayata geçirildi; Orta Doğu pazarına giriş sağlandı." },
  { icon: "🏅", year: "2014", title: "ISO Belgelendirmesi",         desc: "ISO 9001 ve ISO 14001 kalite sistemleri entegre edildi; TSE belgesi alındı." },
  { icon: "🔬", year: "2018", title: "Ar-Ge Merkezi",               desc: "Yerli membran teknolojisi geliştirme hedefiyle İSÇEV Ar-Ge Merkezi kuruldu; 15+ patent başvurusu yapıldı." },
  { icon: "🚀", year: "2024", title: "Küresel Büyüme",              desc: "18 ülke, 300+ proje ve 1.200 m³/saat kapasiteli Riyad Tesisi ile küresel su teknolojisi liderliği pekiştirildi." },
];

const DEFAULT_TEAM = [
  { _id: "1", name: "Mehmet Yıldız",  title: "Kurucu & Genel Müdür",            bio: "25+ yıllık su arıtma sektörü deneyimiyle İSÇEV'i küresel bir teknoloji firmasına dönüştürdü.", linkedin: "#" },
  { _id: "2", name: "Dr. Ayşe Koç",   title: "Ar-Ge ve İnovasyon Direktörü",    bio: "Membran teknolojileri ve ileri oksidasyon prosesleri alanında 12 patent sahibi. ODTÜ Çevre Mühendisliği doktoru.", linkedin: "#" },
  { _id: "3", name: "Hasan Demir",    title: "Uluslararası Projeler Direktörü", bio: "Körfez, Kuzey Afrika ve Orta Asya pazarlarında 80+ uluslararası proje yönetimi deneyimi.", linkedin: "#" },
  { _id: "4", name: "Zeynep Arslan",  title: "Kalite ve Sürdürülebilirlik Müdürü", bio: "ISO 9001/14001 sistem yöneticisi. Çevresel etki değerlendirmesi ve sürdürülebilirlik raporlaması uzmanı.", linkedin: "#" },
];

const DEFAULT_GLOBAL_STATS = [
  { val: "18+",  label: "Aktif Ülke" },
  { val: "300+", label: "Tamamlanan Proje" },
  { val: "2M+",  label: "m³/gün Arıtma Kapasitesi" },
  { val: "98%",  label: "Müşteri Memnuniyeti" },
];

const DEFAULT_REGIONS = [
  { flag: "🇹🇷", region: "Türkiye & Orta Doğu", countries: ["TR", "SA", "AE", "QA", "KW"], projects: 180 },
  { flag: "🌍",  region: "Kuzey Afrika",         countries: ["EG", "MA", "TN", "LY"],       projects: 62  },
  { flag: "🌐",  region: "Orta Asya",            countries: ["KZ", "UZ", "AZ", "TM"],       projects: 38  },
  { flag: "🇪🇺",  region: "Avrupa",               countries: ["DE", "PL", "RO", "BG"],       projects: 24  },
];

const DEFAULT_CERTS = [
  { code: "ISO 9001:2015", label: "Kalite Yönetim Sistemi",     desc: "Ürün ve hizmet kalitemizin uluslararası standartlara uygunluğunu belgeleyen kalite yönetim sistemi sertifikamız.", color: "#1B3F84" },
  { code: "ISO 14001:2015",label: "Çevre Yönetim Sistemi",      desc: "Çevresel etkilerimizi sistematik olarak yöneterek doğal kaynakların korunmasına katkıda bulunduğumuzu belgeleyen sertifikamız.", color: "#4988C5" },
  { code: "TSE",            label: "Türk Standartları Enstitüsü",desc: "Ürün ve hizmetlerimizin yerel standartlara tam uyumunu belgeleyen kalite işaretimiz.", color: "#2a6db5" },
  { code: "CE",             label: "Avrupa Uyumluluk Belgesi",   desc: "Ekipman ve sistemlerimizin Avrupa Birliği güvenlik, sağlık ve çevre direktiflerine uygunluğunu kanıtlayan belge.", color: "#1B3F84" },
];

/* ─── Normalize yardımcılar ───────────────────────────────────────────────── */
const toArray = (v, fallback) =>
  Array.isArray(v) && v.length > 0 ? v : fallback;

const normalizeCountries = (countries) =>
  Array.isArray(countries)
    ? countries
    : typeof countries === "string"
    ? countries.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

/* ════════════════════════════════════════════════════════════════════════════ */
/* ─── BÖLÜM 1: Hero ──────────────────────────────────────────────────────── */
function HeroSection({ heroStats }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #1B3F84 0%, #2552a3 55%, #1B3F84 100%)" }}>
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-[0.07] pointer-events-none" style={{ background: "#DDE9F8" }} />
      <div className="absolute -left-12 bottom-0 w-64 h-64 rounded-full opacity-[0.07] pointer-events-none" style={{ background: "#4988C5" }} />
      <div className="absolute right-1/3 top-1/2 w-48 h-48 rounded-full opacity-[0.04] pointer-events-none" style={{ background: "#DDE9F8" }} />

      <div className="container-iscev relative z-10 py-20 sm:py-28">
        <FadeIn delay={0}>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase mb-4" style={{ color: "#DDE9F8" }}>
            Biz Kimiz
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-gilroy font-bold text-white mb-6 leading-tight max-w-2xl">
            Su Teknolojilerinde<br />
            <span style={{ color: "#DDE9F8" }}>Küresel Uzmanlık,</span><br />
            Yerel Güven
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-sm sm:text-base leading-relaxed max-w-xl" style={{ color: "rgba(221,233,248,0.82)" }}>
            İSÇEV Arıtma ve Çevre Teknolojileri; 1998 yılından bu yana endüstriyel su arıtma,
            atık su geri kazanımı ve anahtar teslim tesis kurulumu alanlarında faaliyet göstermektedir.
          </p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="flex flex-wrap gap-8 mt-10">
            {heroStats.map(({ val, label }) => (
              <div key={label}>
                <p className="text-3xl font-gilroy font-bold text-white">{val}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(221,233,248,0.65)" }}>{label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── BÖLÜM 2: Temel Değerler ────────────────────────────────────────────── */
function ValuesSection({ values }) {
  return (
    <section className="py-20 bg-white">
      <div className="container-iscev">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: "#4988C5" }}>
            Ne İçin Çalışıyoruz
          </p>
          <h2 className="text-2xl sm:text-3xl font-gilroy font-bold text-center mb-3" style={{ color: "#1B3F84" }}>
            Temel Değerlerimiz ve Misyonumuz
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-14 leading-relaxed">
            Her projemizde rehberimiz olan dört temel ilkeyle su yönetiminin geleceğini inşa ediyoruz.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon, title, desc }, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="group flex flex-col gap-5 p-7 rounded-2xl border border-[#DDE9F8] bg-white
                              hover:border-[#4988C5] hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-3xl"
                  style={{ background: "#DDE9F8" }}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-gilroy font-bold mb-2" style={{ color: "#1B3F84" }}>{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── BÖLÜM 3: Kilometre Taşları ─────────────────────────────────────────── */
function TimelineSection({ milestones }) {
  return (
    <section className="py-20" style={{ background: "#F8FBFF" }}>
      <div className="container-iscev">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: "#4988C5" }}>
            Geçmişten Geleceğe
          </p>
          <h2 className="text-2xl sm:text-3xl font-gilroy font-bold text-center mb-3" style={{ color: "#1B3F84" }}>
            Yolculuğumuz ve Kilometre Taşlarımız
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-16 leading-relaxed">
            25 yılı aşkın deneyimle yazdığımız başarı hikayesinin kritik dönüm noktaları.
          </p>
        </FadeIn>

        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: "#DDE9F8" }} />
          <div className="flex flex-col gap-10 lg:gap-0">
            {milestones.map(({ icon, year, title, desc }, i) => {
              const isLeft = i % 2 === 0;
              return (
                <FadeIn key={i} delay={0.05} direction={isLeft ? "right" : "left"}>
                  <div className={`lg:flex lg:items-center lg:gap-0 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                    <div className={`lg:w-[calc(50%-2rem)] ${isLeft ? "lg:pr-10" : "lg:pl-10"}`}>
                      <div className="group bg-white border border-[#DDE9F8] rounded-2xl p-6
                                      hover:shadow-lg hover:border-[#4988C5] transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{icon}</span>
                          <span className="text-xs font-bold px-3 py-1 rounded-full font-gilroy"
                            style={{ background: "#DDE9F8", color: "#1B3F84" }}>
                            {year}
                          </span>
                        </div>
                        <h3 className="text-[15px] font-gilroy font-bold mb-2" style={{ color: "#1B3F84" }}>{title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                    <div className="hidden lg:flex lg:w-16 items-center justify-center shrink-0">
                      <div className="w-4 h-4 rounded-full border-2 z-10"
                        style={{ background: "#1B3F84", borderColor: "#DDE9F8" }} />
                    </div>
                    <div className="hidden lg:block lg:w-[calc(50%-2rem)]" />
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── BÖLÜM 4: Liderlik Kadrosu ──────────────────────────────────────────── */
function TeamSection({ teamMembers }) {
  return (
    <section className="py-20 bg-white">
      <div className="container-iscev">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: "#4988C5" }}>
            İnsan Kaynağımız
          </p>
          <h2 className="text-2xl sm:text-3xl font-gilroy font-bold text-center mb-3" style={{ color: "#1B3F84" }}>
            Liderlik Kadromuz
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-14 leading-relaxed">
            İSÇEV'i küresel ölçekte yönlendiren, alanında uzman lider kadromuzla tanışın.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => {
            const initials = member.initials ?? member.name?.split(" ").map((w) => w[0]).join("").slice(0, 2) ?? "?";
            const photoSrc = member.photoPath ? `${UPLOADS_BASE}/${member.photoPath}` : null;
            return (
              <FadeIn key={member._id ?? i} delay={i * 0.1}>
                <div className="group flex flex-col rounded-2xl border border-[#DDE9F8] bg-white overflow-hidden
                                hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-52 flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #1B3F84 0%, #4988C5 100%)" }}>
                    {photoSrc ? (
                      <img src={photoSrc} alt={member.name}
                        className="w-24 h-24 rounded-full border-4 object-cover"
                        style={{ borderColor: "rgba(255,255,255,0.3)" }} />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center
                                      text-3xl font-gilroy font-bold text-white"
                        style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                        {initials}
                      </div>
                    )}
                    {member.linkedin && member.linkedin !== "#" && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: "rgba(255,255,255,0.18)" }}
                        aria-label={`${member.name} LinkedIn`}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-2">
                    <h3 className="text-[15px] font-gilroy font-bold leading-snug" style={{ color: "#1B3F84" }}>{member.name}</h3>
                    <p className="text-xs font-semibold" style={{ color: "#4988C5" }}>{member.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1 flex-1">{member.bio}</p>
                    {member.linkedin && member.linkedin !== "#" && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold mt-2 w-fit transition-colors duration-150"
                        style={{ color: "#4988C5" }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── BÖLÜM 5: Küresel Güç ───────────────────────────────────────────────── */
function GlobalSection({ globalStats, regions }) {
  return (
    <section className="py-20" style={{ background: "#DDE9F8" }}>
      <div className="container-iscev">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: "#4988C5" }}>
            Dünyaya Yayılan Ağ
          </p>
          <h2 className="text-2xl sm:text-3xl font-gilroy font-bold text-center mb-3" style={{ color: "#1B3F84" }}>
            Küresel Gücümüz ve Pazar Konumumuz
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-14 leading-relaxed">
            4 kıta, 18'den fazla ülke. İSÇEV'in küresel iz düşümü ve uluslararası proje portföyü.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {globalStats.map(({ val, label }, i) => (
              <div key={i}
                className="flex flex-col items-center gap-1 py-7 px-4 rounded-2xl border border-[#C3D9F0] bg-white text-center">
                <span className="text-3xl font-gilroy font-bold" style={{ color: "#1B3F84" }}>{val}</span>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {regions.map(({ flag, region, countries, projects }, i) => {
            const countryList = normalizeCountries(countries);
            return (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl border border-[#C3D9F0] p-6
                                hover:shadow-lg hover:border-[#4988C5] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{flag}</span>
                    <div>
                      <p className="text-[13px] font-gilroy font-bold leading-snug" style={{ color: "#1B3F84" }}>{region}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#4988C5" }}>{projects} Proje</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {countryList.map((c) => (
                      <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#DDE9F8", color: "#1B3F84" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── BÖLÜM 6: Sertifikasyon ─────────────────────────────────────────────── */
function CertSection({ certs }) {
  return (
    <section className="py-20 bg-white">
      <div className="container-iscev">
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: "#4988C5" }}>
            Uluslararası Güvence
          </p>
          <h2 className="text-2xl sm:text-3xl font-gilroy font-bold text-center mb-3" style={{ color: "#1B3F84" }}>
            Sertifikasyon ve Kalite Taahhüdümüz
          </h2>
          <p className="text-sm text-gray-500 text-center max-w-lg mx-auto mb-14 leading-relaxed">
            Her projede aynı titizlik. Uluslararası ve ulusal standart kuruluşlarınca onaylanmış
            kalite sistemimizle güvende olduğunuzu biliyor olun.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {certs.map(({ code, label, desc, color }, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="group flex flex-col rounded-2xl border border-[#DDE9F8] overflow-hidden
                              hover:shadow-lg hover:border-[#4988C5] transition-all duration-300 h-full">
                <div className="py-6 px-5 flex flex-col items-center gap-2 border-b border-[#DDE9F8]"
                  style={{ background: "#F4F9FF" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: color || "#1B3F84" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  </div>
                  <p className="text-lg font-gilroy font-bold" style={{ color: color || "#1B3F84" }}>{code}</p>
                </div>
                <div className="flex flex-col flex-1 p-5 gap-2">
                  <p className="text-[13px] font-gilroy font-bold" style={{ color: "#1B3F84" }}>{label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div className="rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 border border-[#DDE9F8]"
            style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-gilroy font-bold text-white mb-2">
                Kalite Bizim İçin Bir Hedef Değil, Taahhüttür
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(221,233,248,0.80)" }}>
                Her proje, her ekipman ve her hizmet; uluslararası standartlara uyumlu kalite
                süreçlerimizden geçerek müşterilerimize ulaşır. Belgelerimiz bunu kanıtlar.
              </p>
            </div>
            <Link to="/iletisim"
              className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold font-gilroy text-white
                         border border-white/30 hover:bg-white hover:text-[#1B3F84] transition-colors duration-200">
              Bizimle Çalışın
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Ana Bileşen ─────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const [content, setContent] = useState({
    heroStats:   DEFAULT_HERO_STATS,
    values:      DEFAULT_VALUES,
    milestones:  DEFAULT_MILESTONES,
    globalStats: DEFAULT_GLOBAL_STATS,
    regions:     DEFAULT_REGIONS,
    certs:       DEFAULT_CERTS,
  });
  const [teamMembers, setTeamMembers] = useState(DEFAULT_TEAM);

  useEffect(() => {
    /* Kurumsal içerik */
    getCorporate()
      .then((r) => {
        const raw = r?.data ?? r;
        const data = raw?.data ?? raw;
        setContent({
          heroStats:   toArray(data?.heroStats,   DEFAULT_HERO_STATS),
          values:      toArray(data?.values,      DEFAULT_VALUES),
          milestones:  toArray(data?.milestones,  DEFAULT_MILESTONES),
          globalStats: toArray(data?.globalStats, DEFAULT_GLOBAL_STATS),
          regions:     toArray(data?.regions,     DEFAULT_REGIONS),
          certs:       toArray(data?.certs,       DEFAULT_CERTS),
        });
      })
      .catch(() => { /* fallback kalır */ });

    /* Takım */
    api.get("/team")
      .then((r) => {
        const raw  = r?.data ?? r;
        const list = raw?.data?.members ?? raw?.members ?? raw?.data ?? raw;
        if (Array.isArray(list) && list.length > 0) setTeamMembers(list);
      })
      .catch(() => { /* fallback kalır */ });
  }, []);

  return (
    <>
      <PageSEO
        title="Kurumsal — Hakkımızda"
        description="İSÇEV'in 25 yıllık mühendislik deneyimi, ekibimiz, küresel varlığımız ve çevre teknolojilerindeki öncü vizyonumuzu tanıyın."
        canonical="/kurumsal"
      />
      <HeroSection   heroStats={content.heroStats} />
      <ValuesSection values={content.values} />
      <TimelineSection milestones={content.milestones} />
      <TeamSection   teamMembers={teamMembers} />
      <GlobalSection globalStats={content.globalStats} regions={content.regions} />
      <CertSection   certs={content.certs} />
    </>
  );
}
