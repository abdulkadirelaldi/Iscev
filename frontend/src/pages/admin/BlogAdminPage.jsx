import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DataGrid      from "../../components/admin/DataGrid";
import BulkActionBar from "../../components/admin/BulkActionBar";
import FileUploader  from "../../components/common/FileUploader";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "../../api/blog.api";
import { getCategories } from "../../api/category.api";

/* ─── Yayın durumu rozeti ─────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const published = status === "published";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={
        published
          ? { background: "#DCFCE7", color: "#16A34A" }
          : { background: "#FEF9C3", color: "#92400E" }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full"
        style={{ background: published ? "#16A34A" : "#CA8A04" }} />
      {published ? "Yayında" : "Taslak"}
    </span>
  );
}

/* ─── İkon butonu ─────────────────────────────────────────────────────────── */
function IconBtn({ onClick, title, color = "#4988C5", children }) {
  return (
    <button onClick={onClick} title={title}
      className="p-1.5 rounded-lg transition-colors duration-150"
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F0F7FF")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
      style={{ color }}>
      {children}
    </button>
  );
}

/* ─── Onay modalı ─────────────────────────────────────────────────────────── */
function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 font-gilroy">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "#FEE2E2" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1B3F84" }}>
              Blog Yazısını Sil
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold">"{name}"</span> adlı yazıyı silmek
              istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                       text-gray-600 hover:bg-gray-50 transition-colors">
            Vazgeç
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#DC2626" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}>
            Evet, Sil
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Blog form modalı ────────────────────────────────────────────────────── */
function BlogFormModal({ editTarget, onClose, onSaved }) {
  const isEdit = Boolean(editTarget);

  const [form, setForm] = useState({
    title:    editTarget?.title   ?? "",
    content:  editTarget?.content ?? "",
    author:   editTarget?.author  ?? "",
    /* Kategori populate edilmişse _id al */
    category: editTarget?.category?._id ?? editTarget?.category ?? "",
    status:   editTarget?.status  ?? "draft",
    /* Tags: dizi ise virgülle birleştir, string ise direkt kullan */
    tags: Array.isArray(editTarget?.tags)
      ? editTarget.tags.join(", ")
      : (editTarget?.tags ?? ""),
  });
  const [imageFile,  setImageFile]  = useState(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [formError,  setFormError]  = useState(null);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim())   return setFormError("Başlık zorunludur.");
    if (!form.content.trim()) return setFormError("İçerik zorunludur.");
    if (!form.author.trim())  return setFormError("Yazar adı zorunludur.");
    if (!isEdit && !imageFile) return setFormError("Kapak görseli zorunludur.");

    const fd = new FormData();
    fd.append("title",   form.title.trim());
    fd.append("content", form.content.trim());
    fd.append("author",  form.author.trim());
    fd.append("status",  form.status);
    if (form.category)   fd.append("category", form.category);
    if (form.tags.trim()) fd.append("tags", form.tags.trim());
    if (imageFile)       fd.append("coverImage", imageFile);

    setIsLoading(true);
    try {
      if (isEdit) {
        await updateBlog(editTarget._id, fd);
      } else {
        await createBlog(fd);
      }
      onSaved();
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-gilroy " +
    "focus:outline-none focus:ring-2 focus:ring-[#4988C5] focus:border-transparent " +
    "transition-all duration-150 placeholder:text-gray-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }} transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg font-gilroy overflow-hidden">

        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "#1B3F84" }}>
          <h2 className="text-sm font-bold text-white">
            {isEdit ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[78vh] overflow-y-auto">

          {/* Başlık */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Başlık *
            </label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Endüstriyel Su Arıtmada Son Trendler" className={inputClass} />
          </div>

          {/* İçerik */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              İçerik *
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              placeholder="Blog yazısının ana metnini buraya yazın…"
              className={`${inputClass} resize-y min-h-[160px]`}
            />
          </div>

          {/* Yazar & Kategori — yan yana */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
                Yazar *
              </label>
              <input name="author" value={form.author} onChange={handleChange}
                placeholder="Dr. Ahmet Yılmaz" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
                Kategori
              </label>
              <select name="category" value={form.category} onChange={handleChange}
                disabled={catLoading}
                className={`${inputClass} ${catLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ color: form.category ? "#374151" : "#D1D5DB" }}>
                <option value="">
                  {catLoading ? "Yükleniyor…" : "— Seçin —"}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Yayın Durumu
            </label>
            <div className="flex gap-3">
              {[
                { value: "draft",     label: "Taslak",  desc: "Ziyaretçilere görünmez" },
                { value: "published", label: "Yayında", desc: "Sitede görünür" },
              ].map(({ value, label, desc }) => (
                <label key={value}
                  className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer
                             transition-all duration-150"
                  style={{
                    borderColor: form.status === value ? "#4988C5" : "#E5E7EB",
                    background:  form.status === value ? "#F0F6FF" : "#fff",
                  }}>
                  <input type="radio" name="status" value={value} checked={form.status === value}
                    onChange={handleChange} className="sr-only" />
                  <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: form.status === value ? "#4988C5" : "#D1D5DB" }}>
                    {form.status === value && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4988C5" }} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#1B3F84" }}>{label}</p>
                    <p className="text-[10px] text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Etiketler */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Etiketler{" "}
              <span className="font-normal text-gray-400">(virgülle ayırın)</span>
            </label>
            <input name="tags" value={form.tags} onChange={handleChange}
              placeholder="su arıtma, membran teknolojisi, sürdürülebilirlik"
              className={inputClass} />
          </div>

          {/* Kapak görseli */}
          <FileUploader accept="image" maxSizeMB={5}
            label={isEdit ? "Kapak Görseli (değiştirmek için seçin)" : "Kapak Görseli *"}
            onChange={(files) => setImageFile(files[0] ?? null)} />

          {formError && (
            <p className="text-xs text-red-500 font-medium">{formError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 transition-colors">
              İptal
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                         transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#1B3F84" }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "#4988C5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1B3F84")}>
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
              {isLoading ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function BlogAdminPage() {
  const [posts,        setPosts]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState([]);
  const [bulkLoading,  setBulkLoading]  = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await getBlogs();
      const raw  = res?.data ?? res;
      const list = raw?.blogs ?? raw?.data ?? raw;
      setPosts(Array.isArray(list) ? list : []);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlog(deleteTarget._id);
      setDeleteTarget(null);
      fetchPosts();
    } catch {}
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selected.length} blog yazısını silmek istediğinize emin misiniz?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selected.map((id) => deleteBlog(id)));
      setSelected([]);
      fetchPosts();
    } catch { /* silent */ }
    finally { setBulkLoading(false); }
  };

  const filtered = Array.isArray(posts)
    ? posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.author?.toLowerCase().includes(search.toLowerCase()) ||
          (p.category?.name ?? p.category ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const columns = [
    {
      key: "cover", header: "", width: "56px",
      render: (row) =>
        row.coverImagePath ? (
          <img
            src={`${import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000"}/${row.coverImagePath}`}
            alt={row.title}
            className="w-10 h-10 rounded-lg object-cover border border-[#DDE9F8]" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#DDE9F8" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        ),
    },
    {
      key: "title", header: "Başlık",
      render: (row) => (
        <div>
          <p className="font-semibold text-[13px] leading-snug" style={{ color: "#1B3F84" }}>
            {row.title}
          </p>
          {row.author && (
            <p className="text-xs text-gray-400 mt-0.5">{row.author}</p>
          )}
        </div>
      ),
    },
    {
      key: "category", header: "Kategori", noWrap: true,
      /* ↓ Populate edilmiş obje — .name ile güvenli erişim */
      render: (row) => row.category?.name ?? "—",
    },
    {
      key: "status", header: "Durum", align: "center",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt", header: "Tarih", noWrap: true,
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString("tr-TR") : "—",
    },
    {
      key: "actions", header: "", align: "right", noWrap: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn onClick={() => { setEditTarget(row); setShowForm(true); }}
            title="Düzenle" color="#4988C5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </IconBtn>
          <IconBtn onClick={() => setDeleteTarget(row)} title="Sil" color="#EF4444">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 font-gilroy">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1B3F84" }}>Blog Yönetimi</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isLoading ? "Yükleniyor…" : `${filtered.length} yazı listeleniyor`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Başlık, yazar veya kategori ara…"
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#4988C5]
                         transition-all duration-150 w-56" />
          </div>
          <button onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       text-white transition-colors duration-150 shrink-0"
            style={{ background: "#1B3F84" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4988C5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1B3F84")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Yeni Yazı Ekle
          </button>
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyText="Henüz blog yazısı eklenmemiş."
        selectable
        selected={selected}
        onSelectRow={(id, checked) =>
          setSelected((prev) => checked ? [...prev, id] : prev.filter((s) => s !== id))
        }
        onSelectAll={(ids) => setSelected(ids)}
      />

      <BulkActionBar
        count={selected.length}
        onClear={() => setSelected([])}
        actions={[
          {
            label:   bulkLoading ? "Siliniyor…" : "Toplu Sil",
            icon:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
            onClick: handleBulkDelete,
            danger:  true,
          },
        ]}
      />

      <AnimatePresence>
        {showForm && (
          <BlogFormModal
            editTarget={editTarget}
            onClose={() => { setShowForm(false); setEditTarget(null); }}
            onSaved={() => { setShowForm(false); setEditTarget(null); fetchPosts(); }}
          />
        )}
        {deleteTarget && (
          <ConfirmModal
            name={deleteTarget.title}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
