import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../../api/product.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Dummy veri ──────────────────────────────────────────────────────────── */
const DUMMY_PRODUCTS = [
  {
    _id: "1", slug: "endustriyel-ro-sistemi",
    title: "Endüstriyel RO Sistemi",
    description: "Yüksek kapasiteli ters osmoz sistemi. 500–5.000 m³/gün aralığında modüler konfigürasyon imkânı ile her ölçekteki tesise uyarlanabilir.",
    category: { _id: "c1", name: "Endüstriyel", slug: "endustriyel" },
    imageUrl: null,
  },
  {
    _id: "2", slug: "mbr-membran-biyorektor",
    title: "MBR Membran Biyoreaktör",
    description: "Biyolojik arıtma ve membran filtrasyon süreçlerini tek kompakt ünitede birleştiren ileri nesil sistem.",
    category: { _id: "c1", name: "Endüstriyel", slug: "endustriyel" },
    imageUrl: null,
  },
  {
    _id: "3", slug: "uv-dezenfeksiyon-unitesi",
    title: "UV Dezenfeksiyon Ünitesi",
    description: "Kimyasal kullanmadan güçlü UV ışıması ile patojen giderimi. İçme suyu ve proses suyu uygulamaları için sertifikalı çözüm.",
    category: { _id: "c2", name: "Dezenfeksiyon", slug: "dezenfeksiyon" },
    imageUrl: null,
  },
  {
    _id: "4", slug: "kompakt-paket-aritma",
    title: "Kompakt Paket Arıtma",
    description: "Yerden tasarruf sağlayan konteyner tipi modüler sistem. Hızlı kurulum, kolay taşıma ve düşük işletme maliyeti.",
    category: { _id: "c3", name: "Kompakt", slug: "kompakt" },
    imageUrl: null,
  },
  {
    _id: "5", slug: "ozon-aritma-sistemi",
    title: "Ozon Arıtma Sistemi",
    description: "İleri oksidasyon teknolojisiyle organik kirleticileri, koku ve renklenmeyi gidermeye yönelik yüksek verimli ozonlama sistemi.",
    category: { _id: "c2", name: "Dezenfeksiyon", slug: "dezenfeksiyon" },
    imageUrl: null,
  },
  {
    _id: "6", slug: "endustriyel-su-yumusatici",
    title: "Endüstriyel Su Yumuşatıcı",
    description: "İyon değişimi prensibiyle çalışan, kireç ve sertlik giderici sistem. Kazan ve soğutma kulesi uygulamaları için optimum seçim.",
    category: { _id: "c1", name: "Endüstriyel", slug: "endustriyel" },
    imageUrl: null,
  },
  {
    _id: "7", slug: "elektrodeiyonizasyon-edi",
    title: "Elektrodeiyonizasyon (EDI)",
    description: "RO sonrası ultra saf su üretimi için kimyasalsız sürekli iyon giderme. Elektronik ve ilaç sektörü uygulamaları.",
    category: { _id: "c4", name: "Ultra Saf Su", slug: "ultra-saf-su" },
    imageUrl: null,
  },
  {
    _id: "8", slug: "daf-flotasyon-unitesi",
    title: "DAF Flotasyon Ünitesi",
    description: "Çözünmüş hava flotasyonu ile atık sudaki yağ, yüzer madde ve kolloidal partiküllerin giderilmesi.",
    category: { _id: "c1", name: "Endüstriyel", slug: "endustriyel" },
    imageUrl: null,
  },
];

/* ─── Ürün kartı placeholder ikonu ────────────────────────────────────────── */
function PlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 opacity-40">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

/* ─── Skeleton kart ───────────────────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#DDE9F8] bg-white animate-pulse">
      <div className="h-52 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 rounded-full bg-gray-200 w-1/4" />
        <div className="h-4 rounded-full bg-gray-200 w-3/4" />
        <div className="h-3 rounded-full bg-gray-100 w-full" />
        <div className="h-3 rounded-full bg-gray-100 w-4/5" />
        <div className="h-9 rounded-xl bg-gray-100 w-full mt-4" />
      </div>
    </div>
  );
}

/* ─── Ürün kartı ──────────────────────────────────────────────────────────── */
function ProductCard({ product, index }) {
  const catName = product.category?.name ?? product.category ?? null;
  const imgSrc  = product.coverImagePath ? `${UPLOADS_BASE}/${product.coverImagePath}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: (index % 8) * 0.06, ease: "easeOut" }}
    >
      <Link
        to={`/urunler/${product.slug}`}
        className="group flex flex-col rounded-2xl overflow-hidden border border-[#DDE9F8]
                   bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
      >
        {/* ── Görsel ─────────────────────────────────────────────────────── */}
        <div className="relative h-52 overflow-hidden shrink-0"
          style={{ background: "#F4F9FF" }}>
          {imgSrc ? (
            <img src={imgSrc} alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderIcon />
            </div>
          )}

          {/* Kategori rozeti */}
          {catName && (
            <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full
                             backdrop-blur-sm"
              style={{ background: "rgba(73,136,197,0.92)", color: "#fff" }}>
              {catName}
            </span>
          )}

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(27,63,132,0.45) 0%, transparent 55%)" }} />
        </div>

        {/* ── İçerik ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-5 gap-2.5">
          <h3 className="text-[15px] font-gilroy font-bold leading-snug"
            style={{ color: "#1B3F84" }}>
            {product.title}
          </h3>

          {product.description && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
              {product.description}
            </p>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#F0F6FF]">
            <span className="flex items-center gap-1.5 text-xs font-semibold
                             group-hover:gap-2.5 transition-all duration-200"
              style={{ color: "#4988C5" }}>
              Detaylı İncele
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-all duration-200"
              style={{ background: "#DDE9F8" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Arama ikonu ─────────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

/* ─── Boş durum ───────────────────────────────────────────────────────────── */
function EmptyState({ query }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#DDE9F8" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <div>
        <p className="font-gilroy font-semibold text-sm" style={{ color: "#1B3F84" }}>
          {query ? `"${query}" için sonuç bulunamadı` : "Bu kategoride ürün bulunamadı"}
        </p>
        <p className="text-xs text-gray-400 mt-1">Farklı anahtar kelime veya kategori deneyin.</p>
      </div>
    </div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [products,       setProducts]       = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [query,          setQuery]          = useState("");

  /* ── Veri çek ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    getProducts({ isActive: true, limit: 200 })
      .then((res) => {
        const raw  = res?.data ?? res;
        const list = raw?.products ?? raw?.data ?? raw;
        setProducts(Array.isArray(list) ? list : DUMMY_PRODUCTS);
      })
      .catch(() => setProducts(DUMMY_PRODUCTS))
      .finally(() => setIsLoading(false));
  }, []);

  /* ── Kategoriler ──────────────────────────────────────────────────────── */
  const categories = useMemo(() => {
    if (!Array.isArray(products)) return ["ALL"];
    const names = products
      .map((p) => p.category?.name ?? p.category)
      .filter(Boolean);
    return ["ALL", ...new Set(names)];
  }, [products]);

  /* ── Filtrele + Ara ───────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => {
      const catName  = p.category?.name ?? p.category ?? "";
      const matchCat = activeCategory === "ALL" || catName === activeCategory;
      const q        = query.toLowerCase().trim();
      const matchQ   = !q
        || p.title?.toLowerCase().includes(q)
        || p.description?.toLowerCase().includes(q)
        || catName.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, activeCategory, query]);

  return (
    <>
      <PageSEO
        title="Ürünler — Su Arıtma Ekipmanları"
        description="İSÇEV'in endüstriyel su arıtma, filtrasyon ve kimyasal dozlama ürünlerini keşfedin. Yüksek kaliteli mühendislik çözümleri."
        canonical="/urunler"
      />
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2552a3 60%, #1B3F84 100%)" }}>
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-[0.07] pointer-events-none"
          style={{ background: "#DDE9F8" }} />
        <div className="absolute -left-10 bottom-0 w-56 h-56 rounded-full opacity-[0.07] pointer-events-none"
          style={{ background: "#4988C5" }} />

        <div className="container-iscev relative z-10 py-16 sm:py-24">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-semibold tracking-[0.22em] uppercase mb-4"
            style={{ color: "#DDE9F8" }}>
            Ürün Kataloğu
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-gilroy font-bold text-white mb-5
                       leading-tight max-w-2xl">
            Geleceğin Su Arıtma
            <br />
            <span style={{ color: "#DDE9F8" }}>Teknolojileri</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="text-sm sm:text-base max-w-lg leading-relaxed mb-10"
            style={{ color: "rgba(221,233,248,0.80)" }}>
            Endüstriyel ölçekten kompakt sistemlere, membran teknolojisinden ileri oksidasyona —
            sürdürülebilir su yönetimi için kapsamlı çözüm portföyümüz.
          </motion.p>

          {/* ── Arama çubuğu ────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(27,63,132,0.5)" }}>
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün ara… (örn: RO, MBR, UV)"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none
                         font-gilroy shadow-lg transition-shadow duration-200
                         focus:shadow-xl"
              style={{ background: "rgba(255,255,255,0.97)", color: "#1B3F84" }}
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                           transition-colors duration-150"
                style={{ color: "#4988C5" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── İçerik ──────────────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev">

          {/* ── Kategori filtre çubuğu ─────────────────────────────────── */}
          {!isLoading && categories.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-center gap-2 mb-8">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                  style={activeCategory === cat
                    ? { background: "#1B3F84", color: "#fff" }
                    : { background: "#DDE9F8", color: "#1B3F84" }}>
                  {cat === "ALL" ? "Tümü" : cat}
                </button>
              ))}

              {/* Sonuç sayacı */}
              {!isLoading && (
                <span className="ml-auto text-xs text-gray-400 font-medium">
                  {filtered.length} ürün
                </span>
              )}
            </motion.div>
          )}

          {/* ── Grid ───────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <div key={`${activeCategory}-${query}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                : filtered.length === 0
                  ? <EmptyState query={query} />
                  : filtered.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))
              }
            </div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA bant ────────────────────────────────────────────────────── */}
      {!isLoading && (
        <section className="py-14 bg-white border-t border-[#DDE9F8]">
          <div className="container-iscev">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55 }}
              className="rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center
                         justify-between gap-6"
              style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-gilroy font-bold text-white mb-2">
                  Projeniz için doğru çözümü birlikte bulalım
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(221,233,248,0.80)" }}>
                  Teknik ekibimiz, ihtiyacınıza özel ürün kombinasyonu ve fizibilite raporu için hazır.
                </p>
              </div>
              <Link to="/iletisim"
                className="shrink-0 px-7 py-3 rounded-xl text-sm font-gilroy font-semibold
                           bg-white transition-all duration-200 hover:bg-[#DDE9F8]"
                style={{ color: "#1B3F84" }}>
                Teklif Alın
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
