import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getBlogBySlug } from "../../api/blog.api";
import PageSEO from "../../components/common/PageSEO";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

const imgUrl = (path) => (path ? `${UPLOADS_BASE}/${path}` : null);

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });
};

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse font-gilroy">
      <div className="w-full bg-gray-200" style={{ height: 480 }} />
      <div className="container-iscev max-w-3xl mx-auto py-12 space-y-4">
        <div className="h-3 bg-gray-100 rounded-full w-32" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 rounded-full w-4/6 mt-6" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
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
          Blog Yazısı Bulunamadı
        </h2>
        <p className="text-sm text-gray-500">
          Aradığınız yazı mevcut değil veya kaldırılmış olabilir.
        </p>
      </div>
      <button onClick={onBack}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "#1B3F84" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Blog'a Geri Dön
      </button>
    </div>
  );
}

/* ─── Ana bileşen ─────────────────────────────────────────────────────────── */
export default function BlogDetail() {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  const [blog,      setBlog]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const res  = await getBlogBySlug(slug);
      const data = res?.data?.blog ?? res?.blog ?? res?.data ?? res;
      if (!data?._id) throw new Error("empty");
      setBlog(data);
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
  if (notFound || !blog) return <NotFound onBack={() => navigate("/blog")} />;

  /* ── Veri hazırla ────────────────────────────────────────────────────────── */
  const coverSrc   = imgUrl(blog.coverImagePath);
  const tags       = Array.isArray(blog.tags) ? blog.tags.filter(Boolean) : [];
  const dateStr    = formatDate(blog.publishedAt);
  const authorInit = blog.author?.charAt(0)?.toUpperCase() ?? "Y";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="font-gilroy"
    >
      <PageSEO
        title={blog.metaTitle || blog.title}
        description={blog.metaDescription || blog.excerpt || "İSÇEV Blog yazısı"}
        canonical={`/blog/${blog.slug}`}
        image={blog.coverImagePath ? `/${blog.coverImagePath}` : undefined}
        type="article"
      />
      {/* ① Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden"
        style={{ maxHeight: 480, minHeight: 320, background: "#0d1f42" }}>

        {coverSrc ? (
          <img
            src={coverSrc}
            alt={blog.title}
            className="w-full object-cover"
            style={{ maxHeight: 480, width: "100%" }}
          />
        ) : (
          <div className="w-full" style={{
            height: 480,
            background: "linear-gradient(135deg, #1B3F84 0%, #0d1f42 100%)",
          }} />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, transparent 30%, rgba(27,63,132,0.85) 100%)",
        }} />

        {/* İçerik */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-8 sm:px-10 sm:py-10">
          <div className="container-iscev max-w-3xl mx-auto">

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span key={tag}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "#DDE9F8", color: "#1B3F84" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Başlık */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-gilroy font-bold
                           text-white leading-tight mb-4">
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.80)" }}>
              {blog.author && (
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {blog.author}
                </span>
              )}
              {dateStr && (
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8"  y1="2" x2="8"  y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
                  </svg>
                  {dateStr}
                </span>
              )}
              {blog.viewCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {blog.viewCount} okuma
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ② Makale içeriği ──────────────────────────────────────────────────── */}
      <section className="py-12" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev max-w-3xl mx-auto">

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-[15px] leading-relaxed italic text-gray-500 mb-8
                           border-l-4 pl-4"
              style={{ borderColor: "#4988C5" }}>
              {blog.excerpt}
            </p>
          )}

          {/* HTML içerik */}
          {blog.content && (
            <div
              className="prose prose-lg max-w-none text-gray-700
                          prose-headings:font-gilroy prose-headings:text-[#1B3F84]
                          prose-a:text-[#4988C5] prose-strong:text-[#1B3F84]
                          prose-blockquote:border-[#4988C5] prose-blockquote:text-gray-500"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          )}

          {/* ③ Yazar kutusu ─────────────────────────────────────────────── */}
          {blog.author && (
            <div className="mt-12 flex items-center gap-4 p-5 rounded-2xl border border-[#DDE9F8]"
              style={{ background: "#ffffff" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center
                              text-white text-lg font-bold shrink-0"
                style={{ background: "#1B3F84" }}>
                {authorInit}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"
                  style={{ color: "#4988C5" }}>
                  Yazar
                </p>
                <p className="text-sm font-bold" style={{ color: "#1B3F84" }}>
                  {blog.author}
                </p>
              </div>
            </div>
          )}

          {/* ④ Geri dön linki ───────────────────────────────────────────── */}
          <div className="mt-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold
                         transition-colors duration-150 hover:opacity-75"
              style={{ color: "#4988C5" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Tüm yazılara dön
            </Link>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
