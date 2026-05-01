import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DataGrid      from "../../components/admin/DataGrid";
import BulkActionBar from "../../components/admin/BulkActionBar";
import FileUploader  from "../../components/common/FileUploader";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../../api/product.api";
import { getCategories } from "../../api/category.api";

/* ─── Durum rozeti ────────────────────────────────────────────────────────── */
function StatusBadge({ active }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={
        active
          ? { background: "#DCFCE7", color: "#16A34A" }
          : { background: "#FEE2E2", color: "#DC2626" }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? "#16A34A" : "#DC2626" }} />
      {active ? "Aktif" : "Pasif"}
    </span>
  );
}

/* ─── İkon butonları ──────────────────────────────────────────────────────── */
function IconBtn({ onClick, title, color = "#4988C5", children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg transition-colors duration-150"
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F0F7FF")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
      style={{ color }}
    >
      {children}
    </button>
  );
}

/* ─── Onay modalı ─────────────────────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{    scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 font-gilroy"
      >
        <p className="text-sm text-gray-600 mb-6 text-center">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                       text-gray-600 hover:bg-gray-50 transition-colors">
            Vazgeç
          </button>
          <button onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                       transition-colors"
            style={{ background: "#DC2626" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}>
            Sil
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Ürün formu modal ────────────────────────────────────────────────────── */
function ProductFormModal({ editTarget, onClose, onSaved }) {
  const isEdit = Boolean(editTarget);

  const [form, setForm]       = useState({
    name:        editTarget?.name        ?? "",
    category:    editTarget?.category?._id ?? editTarget?.category ?? "",
    description: editTarget?.description ?? "",
    isActive:    editTarget?.isActive    ?? true,
  });
  const [imageFile,  setImageFile]  = useState(null);
  const [formError,  setFormError]  = useState(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  /* Kategorileri yükle */
  useEffect(() => {
    getCategories()
      .then((list) => setCategories(Array.isArray(list) ? list : []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim())  return setFormError("Ürün adı zorunludur.");
    if (!form.category)     return setFormError("Kategori seçimi zorunludur.");
    if (!isEdit && !imageFile) return setFormError("Kapak görseli zorunludur.");

    /* FormData — tarayıcı boundary'yi otomatik ayarlar,
       Content-Type başlığını manuel geçme! */
    const fd = new FormData();
    fd.append("name",        form.name.trim());
    fd.append("category",    form.category.trim());
    fd.append("description", form.description.trim());
    fd.append("isActive",    String(form.isActive));
    if (imageFile) fd.append("coverImage", imageFile); // Multer alan adı: coverImage

    setIsLoading(true);
    try {
      if (isEdit) {
        await updateProduct(editTarget._id, fd);
      } else {
        await createProduct(fd);
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
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg font-gilroy overflow-hidden"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: "#1B3F84" }}>
          <h2 className="text-sm font-bold text-white">
            {isEdit ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Ürün Adı */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Ürün Adı *
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Membran Biyoreaktör Sistemi" className={inputClass} />
          </div>

          {/* Kategori — select */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Kategori *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={catLoading}
              className={`${inputClass} ${catLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ borderColor: "#DDE9F8", color: form.category ? "#374151" : "#D1D5DB" }}
            >
              <option value="" disabled>
                {catLoading ? "Kategoriler yükleniyor…" : "Kategori seçin"}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {!catLoading && categories.length === 0 && (
              <p className="text-[11px] mt-1.5" style={{ color: "#4988C5" }}>
                Henüz kategori yok.{" "}
                <a href="/admin/kategoriler" target="_blank" rel="noopener noreferrer"
                  className="underline hover:opacity-70">
                  Kategori ekle →
                </a>
              </p>
            )}
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Açıklama
            </label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Ürün açıklaması..."
              className={`${inputClass} resize-none`} />
          </div>

          {/* Görsel */}
          <FileUploader
            accept="image"
            maxSizeMB={5}
            label="Kapak Görseli"
            onChange={(files) => setImageFile(files[0] ?? null)}
          />

          {/* Aktif switch */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" name="isActive" checked={form.isActive}
                onChange={handleChange} className="sr-only peer" />
              <div className="w-10 h-5 rounded-full transition-colors duration-200 peer-checked:bg-[#1B3F84] bg-gray-200" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow
                             transition-transform duration-200 peer-checked:translate-x-5" />
            </div>
            <span className="text-xs font-semibold" style={{ color: "#1B3F84" }}>
              {form.isActive ? "Aktif" : "Pasif"}
            </span>
          </label>

          {/* Hata */}
          {formError && (
            <p className="text-xs text-red-500 font-medium">{formError}</p>
          )}

          {/* Butonlar */}
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
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"/>
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
export default function ProductsAdminPage() {
  const [products,     setProducts]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState([]);
  const [bulkLoading,  setBulkLoading]  = useState(false);

  /* ── Veri yükle ──────────────────────────────────────────────────────── */
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProducts();
      // Backend: { products:[...] } | { data:[...] } | [...] | axios response
      const raw = res?.data ?? res;
      const list = raw?.products ?? raw?.data ?? raw;
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── Silme ────────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget._id);
      setDeleteTarget(null);
      fetchProducts();
    } catch { /* hata yönetimi ileride toast ile yapılacak */ }
  };

  /* ── Durum toggle ──────────────────────────────────────────────────────── */
  const handleToggle = async (row) => {
    try {
      await toggleProductStatus(row._id);
      fetchProducts();
    } catch {}
  };

  /* ── Bulk: toplu sil ────────────────────────────────────────────────────── */
  const handleBulkDelete = async () => {
    if (!window.confirm(`${selected.length} ürünü silmek istediğinize emin misiniz?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selected.map((id) => deleteProduct(id)));
      setSelected([]);
      fetchProducts();
    } catch { /* silent */ }
    finally { setBulkLoading(false); }
  };

  /* ── Bulk: toplu pasife al ───────────────────────────────────────────────── */
  const handleBulkDeactivate = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(selected.map((id) => toggleProductStatus(id)));
      setSelected([]);
      fetchProducts();
    } catch { /* silent */ }
    finally { setBulkLoading(false); }
  };

  /* ── Arama filtresi ────────────────────────────────────────────────────── */
  const filtered = Array.isArray(products)
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          (p.category?.name ?? p.category ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  /* ── Tablo sütunları ───────────────────────────────────────────────────── */
  const columns = [
    {
      key:    "image",
      header: "",
      width:  "56px",
      render: (row) =>
        row.imageUrl ? (
          <img src={row.imageUrl} alt={row.name}
            className="w-10 h-10 rounded-lg object-cover border border-[#DDE9F8]" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#DDE9F8" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="w-5 h-5" style={{ color: "#4988C5" }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        ),
    },
    {
      key:    "name",
      header: "Ürün Adı",
      render: (row) => (
        <div>
          <p className="font-semibold text-[13px]" style={{ color: "#1B3F84" }}>{row.name}</p>
          {row.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key:    "category",
      header: "Kategori",
      noWrap: true,
      render: (row) => row.category?.name ?? "—",
    },
    {
      key:    "isActive",
      header: "Durum",
      align:  "center",
      render: (row) => <StatusBadge active={row.isActive} />,
    },
    {
      key:    "createdAt",
      header: "Oluşturma Tarihi",
      noWrap: true,
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("tr-TR")
          : "—",
    },
    {
      key:    "actions",
      header: "",
      align:  "right",
      noWrap: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* Durum toggle */}
          <IconBtn onClick={() => handleToggle(row)}
            title={row.isActive ? "Pasife Al" : "Aktif Et"}
            color={row.isActive ? "#F59E0B" : "#16A34A"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              {row.isActive
                ? <><path d="M18.36 6.64A9 9 0 0 1 20 12a8 8 0 0 1-8 8 9 9 0 0 1-6.36-2.64"/>
                    <path d="M9 2h6M12 2v4"/></>
                : <><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></>
              }
            </svg>
          </IconBtn>

          {/* Düzenle */}
          <IconBtn onClick={() => { setEditTarget(row); setShowForm(true); }}
            title="Düzenle" color="#4988C5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </IconBtn>

          {/* Sil */}
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

      {/* ── Üst Bar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1B3F84" }}>Ürün Yönetimi</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isLoading ? "Yükleniyor…" : `${filtered.length} ürün listeleniyor`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Arama */}
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün veya kategori ara…"
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#4988C5]
                         transition-all duration-150 w-52"
            />
          </div>

          {/* Yeni Ürün Ekle */}
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       text-white transition-colors duration-150 shrink-0"
            style={{ background: "#1B3F84" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4988C5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1B3F84")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* ── DataGrid ─────────────────────────────────────────────────────────── */}
      <DataGrid
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyText="Henüz ürün eklenmemiş. Yeni ürün eklemek için butona tıklayın."
        selectable
        selected={selected}
        onSelectRow={(id, checked) =>
          setSelected((prev) => checked ? [...prev, id] : prev.filter((s) => s !== id))
        }
        onSelectAll={(ids) => setSelected(ids)}
      />

      {/* ── Bulk Action Bar ──────────────────────────────────────────────────── */}
      <BulkActionBar
        count={selected.length}
        onClear={() => setSelected([])}
        actions={[
          {
            label:   "Pasife Al",
            icon:    "M18.36 6.64A9 9 0 0 1 20 12a8 8 0 0 1-8 8 9 9 0 0 1-6.36-2.64M9 2h6M12 2v4",
            onClick: handleBulkDeactivate,
          },
          {
            label:   bulkLoading ? "Siliniyor…" : "Toplu Sil",
            icon:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
            onClick: handleBulkDelete,
            danger:  true,
          },
        ]}
      />

      {/* ── Modaller ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <ProductFormModal
            editTarget={editTarget}
            onClose={() => { setShowForm(false); setEditTarget(null); }}
            onSaved={() => { setShowForm(false); setEditTarget(null); fetchProducts(); }}
          />
        )}
        {deleteTarget && (
          <ConfirmModal
            message={`"${deleteTarget.name}" adlı ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
