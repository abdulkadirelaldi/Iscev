import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getBlogs } from "../../api/blog.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Dummy veri ──────────────────────────────────────────────────────────── */
const DUMMY_BLOGS = [
  {
    _id: "1", slug: "membran-teknolojilerindeki-son-gelismeler",
    title: "Membran Teknolojilerindeki Son Gelişmeler",
    excerpt: "2024 yılında endüstriyel su arıtma alanındaki membran teknolojileri büyük bir ivme kazandı. Nano-filtrasyon ve ters ozmoz sistemlerindeki yenilikler inceleniyor.",
    author: "Dr. Ahmet Yılmaz", category: "Teknoloji",
    createdAt: "2024-05-15T09:00:00Z", imageUrl: null,
  },
  {
    _id: "2", slug: "kuresel-su-krizi-ve-endustriyel-cozumler",
    title: "Küresel Su Krizi ve Endüstriyel Çözümler",
    excerpt: "Dünya genelinde içme suyu kaynaklarının hızla azalması, endüstriyel geri dönüşüm sistemlerine olan talebi katlanarak artırıyor. İSÇEV'in bu alandaki yaklaşımı.",
    author: "Mühendis Zeynep Kaya", category: "Sürdürülebilirlik",
    createdAt: "2024-04-22T10:30:00Z", imageUrl: null,
  },
  {
    _id: "3", slug: "riyad-projesi-tamamlandi",
    title: "Riyad Su Geri Kazanım Tesisi Devreye Alındı",
    excerpt: "İSÇEV'in Suudi Arabistan'daki en büyük projesi olan 1200 m³/h kapasiteli tesis, zamanında ve bütçe dahilinde başarıyla teslim edildi.",
    author: "İSÇEV Basın Birimi", category: "Proje Haberleri",
    createdAt: "2024-03-10T08:00:00Z", imageUrl: null,
  },
  {
    _id: "4", slug: "iso-14001-sertifikasi-yenilendi",
    title: "ISO 14001 Çevre Yönetim Sertifikamız Yenilendi",
    excerpt: "İSÇEV, çevre yönetim sistemleri kapsamında aldığı ISO 14001:2015 sertifikasını başarıyla yeniledi. Sürdürülebilir üretim taahhüdümüz güçlenerek devam ediyor.",
    author: "Kalite Departmanı", category: "Kurumsal",
    createdAt: "2024-02-18T11:00:00Z", imageUrl: null,
  },
  {
    _id: "5", slug: "atik-su-yonetimi-sempozyumu",
    title: "Atık Su Yönetimi Uluslararası Sempozyumu'ndaydık",
    excerpt: "Dubai'de düzenlenen sempozyumda İSÇEV Ar-Ge ekibimiz MBR teknolojileri üzerine bildiri sunarak sektörün en güncel tartışmalarına katkıda bulundu.",
    author: "Ar-Ge Ekibi", category: "Etkinlik",
    createdAt: "2024-01-30T14:00:00Z", imageUrl: null,
  },
  {
    _id: "6", slug: "endustriyel-aritma-maliyetleri-nasil-dusurulur",
    title: "Endüstriyel Arıtma Maliyetleri Nasıl Düşürülür?",
    excerpt: "Enerji optimizasyonu, akıllı sensör entegrasyonu ve kestirimci bakım yöntemleriyle arıtma tesis işletim maliyetleri %30'a kadar azaltılabiliyor.",
    author: "Dr. Ahmet Yılmaz", category: "Teknoloji",
    createdAt: "2024-01-05T09:00:00Z", imageUrl: null,
  },
];

/* ─── Kategori renk haritası ──────────────────────────────────────────────── */
const CATEGORY_COLORS = {
  "Teknoloji":        { bg: "#DDE9F8", text: "#1B3F84" },
  "Sürdürülebilirlik":{ bg: "#DCFCE7", text: "#16A34A" },
  "Proje Haberleri":  { bg: "#FEF9C3", text: "#92400E" },
  "Kurumsal":         { bg: "#F3E8FF", text: "#7C3AED" },
  "Etkinlik":         { bg: "#FFE4E6", text: "#BE123C" },
};
const catStyle = (cat) =>
  CATEGORY_COLORS[cat] ?? { bg: "#DDE9F8", text: "#1B3F84" };

/* ─── Tarih formatla ──────────────────────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function BlogSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#DDE9F8] bg-white animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-6 space-y-3">
        <div className="h-2.5 rounded-full bg-gray-200 w-1/4" />
        <div className="h-4 rounded-full bg-gray-200 w-3/4" />
        <div className="h-4 rounded-full bg-gray-200 w-2/3" />
        <div className="h-3 rounded-full bg-gray-100 w-full" />
        <div className="h-3 rounded-full bg-gray-100 w-4/5" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 rounded-full bg-gray-100 w-1/3" />
          <div className="h-3 rounded-full bg-gray-100 w-1/4" />
        </div>
      </div>
    </div>
  );
}

/* ─── Blog kartı ──────────────────────────────────────────────────────────── */
function BlogCard({ post, index, featured = false }) {
  const imgSrc  = post.coverImagePath ? `${UPLOADS_BASE}/${post.coverImagePath}` : null;
  const colors  = catStyle(post.category?.name ?? post.category);

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
        className="col-span-full"
      >
        <Link
          to={`/blog/${post.slug}`}
          className="group flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-[#DDE9F8]
                     bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          {/* Görsel */}
          <div className="relative lg:w-2/5 h-56 lg:h-auto shrink-0 overflow-hidden"
            style={{ background: "#DDE9F8", minHeight: "280px" }}>
            {imgSrc
              ? <img src={imgSrc} alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1"
                    strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 opacity-40">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
            }
            <span className="absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(27,63,132,0.85)", color: "#DDE9F8" }}>
              Öne Çıkan
            </span>
          </div>

          {/* İçerik */}
          <div className="flex flex-col justify-center p-8 gap-4">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full self-start"
              style={{ background: colors.bg, color: colors.text }}>
              {post.category?.name ?? post.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-gilroy font-bold leading-snug"
              style={{ color: "#1B3F84" }}>
              {post.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {fmtDate(post.createdAt)}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold mt-1
                             group-hover:gap-2.5 transition-all duration-200"
              style={{ color: "#4988C5" }}>
              Devamını Oku
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group flex flex-col rounded-2xl overflow-hidden border border-[#DDE9F8]
                   bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
      >
        {/* Görsel */}
        <div className="relative h-48 overflow-hidden shrink-0" style={{ background: "#DDE9F8" }}>
          {imgSrc
            ? <img src={imgSrc} alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            : <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 opacity-40">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
          }
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(to top, rgba(27,63,132,0.5) 0%, transparent 60%)" }} />
        </div>

        {/* İçerik */}
        <div className="flex flex-col flex-1 p-5 gap-2.5">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full self-start"
            style={{ background: colors.bg, color: colors.text }}>
            {post.category}
          </span>
          <h3 className="text-[14px] font-bold font-gilroy leading-snug" style={{ color: "#1B3F84" }}>
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 pt-1 border-t border-[#F0F6FF] mt-1">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {fmtDate(post.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Filtre butonu ───────────────────────────────────────────────────────── */
function FilterBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
      style={active
        ? { background: "#1B3F84", color: "#fff" }
        : { background: "#DDE9F8", color: "#1B3F84" }}>
      {label}
    </button>
  );
}

const PAGE_SIZE = 9;

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function BlogPage() {
  const [posts,      setPosts]      = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [activeCategory, setActiveCat] = useState("ALL");
  const [page,       setPage]       = useState(1);

  useEffect(() => {
    getBlogs()
      .then((res) => {
        const raw  = res?.data ?? res;
        const list = raw?.blogs ?? raw?.data ?? raw;
        setPosts(Array.isArray(list) ? list : DUMMY_BLOGS);
      })
      .catch(() => setPosts(DUMMY_BLOGS))
      .finally(() => setIsLoading(false));
  }, []);

  /* Kategori değişince sayfa sıfırla */
  const handleCatChange = (cat) => {
    setActiveCat(cat);
    setPage(1);
  };

  const filtered   = activeCategory === "ALL"
    ? posts
    : posts.filter((p) => (p.category?.name ?? p.category) === activeCategory);

  const categories = ["ALL", ...new Set(posts.map((p) => p.category?.name ?? p.category).filter(Boolean))];
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(0, page * PAGE_SIZE);
  const [featured, ...rest] = paginated;
  const hasMore    = page < totalPages;

  return (
    <>
      <PageSEO
        title="Blog — Su Arıtma Haberleri"
        description="İSÇEV Blog: endüstriyel su arıtma teknolojileri, çevre mevzuatı ve sürdürülebilirlik konularında uzman makaleler ve sektör haberleri."
        canonical="/blog"
      />
      {/* ── Hero-mini ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}>
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: "#DDE9F8" }} />
        <div className="container-iscev relative z-10 py-14 sm:py-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#DDE9F8" }}>
            Haberler & Duyurular
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-gilroy font-bold text-white mb-4 leading-tight">
            Blog & Sektör Haberleri
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="text-sm max-w-lg leading-relaxed"
            style={{ color: "rgba(221,233,248,0.8)" }}>
            Su teknolojileri, endüstriyel arıtma trendleri ve İSÇEV proje haberleri.
          </motion.p>
        </div>
      </section>

      {/* ── İçerik ─────────────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev">

          {/* Kategori filtresi */}
          {!isLoading && categories.length > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-wrap items-center gap-2 mb-8">
              {categories.map((c) => (
                <FilterBtn key={c}
                  label={c === "ALL" ? "Tümü" : c}
                  active={activeCategory === c}
                  onClick={() => handleCatChange(c)} />
              ))}
              <span className="ml-auto text-xs text-gray-400 font-medium">
                {filtered.length} yazı
              </span>
            </motion.div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#DDE9F8" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#1B3F84" }}>
                Bu kategoride henüz yazı yok
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured && <BlogCard post={featured} index={0} featured />}
                {rest.map((post, i) => (
                  <BlogCard key={post._id} post={post} index={i + 1} />
                ))}
              </div>

              {/* Daha Fazla Yükle */}
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold
                               border-2 transition-all duration-150"
                    style={{ borderColor: "#1B3F84", color: "#1B3F84" }}
                  >
                    Daha Fazla Yükle
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.button>
                </div>
              )}

              {/* Sayfa göstergesi */}
              {totalPages > 1 && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} yazı gösteriliyor
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
