import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DataGrid     from "../../components/admin/DataGrid";
import FileUploader from "../../components/common/FileUploader";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../api/service.api";
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
            <p className="text-sm font-semibold mb-1" style={{ color: "#1B3F84" }}>Hizmeti Sil</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold">"{name}"</span> adlı hizmeti silmek
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
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
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

/* ─── Hizmet form modalı ──────────────────────────────────────────────────── */
function ServiceFormModal({ editTarget, onClose, onSaved }) {
  const isEdit = Boolean(editTarget);

  const [form, setForm] = useState({
    name:        editTarget?.name        ?? "",
    description: editTarget?.description ?? "",
    /* Kategori populate edilmişse _id al, string ise direkt kullan */
    category:    editTarget?.category?._id ?? editTarget?.category ?? "",
    isActive:    editTarget?.isActive    ?? true,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim())  return setFormError("Hizmet adı zorunludur.");
    if (!form.category)     return setFormError("Kategori seçimi zorunludur.");
    if (!isEdit && !imageFile) return setFormError("Kapak görseli zorunludur.");

    const fd = new FormData();
    fd.append("name",        form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("category",    form.category);
    fd.append("isActive",    String(form.isActive));
    if (imageFile) fd.append("coverImage", imageFile);

    setIsLoading(true);
    try {
      if (isEdit) {
        await updateService(editTarget._id, fd);
      } else {
        await createService(fd);
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
            {isEdit ? "Hizmet Düzenle" : "Yeni Hizmet Ekle"}
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

          {/* Ad */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Hizmet Adı *
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Endüstriyel Su Arıtma" className={inputClass} />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Kategori *
            </label>
            <select name="category" value={form.category} onChange={handleChange}
              disabled={catLoading}
              className={`${inputClass} ${catLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ color: form.category ? "#374151" : "#D1D5DB" }}>
              <option value="" disabled>
                {catLoading ? "Kategoriler yükleniyor…" : "Kategori seçin"}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Açıklama
            </label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Hizmet açıklaması…"
              className={`${inputClass} resize-none`} />
          </div>

          {/* Görsel */}
          <FileUploader accept="image" maxSizeMB={5}
            label={isEdit ? "Kapak Görseli (değiştirmek için seçin)" : "Kapak Görseli *"}
            onChange={(files) => setImageFile(files[0] ?? null)} />

          {/* Aktif toggle */}
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
export default function ServicesAdminPage() {
  const [services,     setServices]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search,       setSearch]       = useState("");

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res  = await getServices();
      const raw  = res?.data ?? res;
      const list = raw?.services ?? raw?.data ?? raw;
      setServices(Array.isArray(list) ? list : []);
    } catch {
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteService(deleteTarget._id);
      setDeleteTarget(null);
      fetchServices();
    } catch {}
  };

  const filtered = Array.isArray(services)
    ? services.filter(
        (s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          (s.category?.name ?? s.category ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const columns = [
    {
      key: "image", header: "", width: "56px",
      render: (row) =>
        row.imageUrl ? (
          <img src={row.imageUrl} alt={row.name}
            className="w-10 h-10 rounded-lg object-cover border border-[#DDE9F8]" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#DDE9F8" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
        ),
    },
    {
      key: "name", header: "Hizmet Adı",
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
      key: "category", header: "Kategori", noWrap: true,
      /* ↓ Kategori artık populate edilmiş obje — .name ile erişiyoruz */
      render: (row) => row.category?.name ?? "—",
    },
    {
      key: "isActive", header: "Durum", align: "center",
      render: (row) => <StatusBadge active={row.isActive} />,
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
          <h1 className="text-xl font-bold" style={{ color: "#1B3F84" }}>Hizmet Yönetimi</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isLoading ? "Yükleniyor…" : `${filtered.length} hizmet listeleniyor`}
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
              placeholder="Hizmet veya kategori ara…"
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#4988C5]
                         transition-all duration-150 w-52" />
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
            Yeni Hizmet Ekle
          </button>
        </div>
      </div>

      <DataGrid columns={columns} data={filtered} isLoading={isLoading}
        emptyText="Henüz hizmet eklenmemiş." />

      <AnimatePresence>
        {showForm && (
          <ServiceFormModal
            editTarget={editTarget}
            onClose={() => { setShowForm(false); setEditTarget(null); }}
            onSaved={() => { setShowForm(false); setEditTarget(null); fetchServices(); }}
          />
        )}
        {deleteTarget && (
          <ConfirmModal
            name={deleteTarget.name}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
