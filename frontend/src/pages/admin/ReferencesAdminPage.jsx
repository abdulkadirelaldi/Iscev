import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import DataGrid     from "../../components/admin/DataGrid";
import FileUploader from "../../components/common/FileUploader";
import {
  getReferences,
  createReference,
  updateReference,
  deleteReference,
  toggleReferenceStatus,
} from "../../api/reference.api";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Boş form ────────────────────────────────────────────────────────────── */
const _EMPTY_FORM = { name: "", sector: "", location: "", isActive: true, order: 0 };

/* ─── Durum rozeti ────────────────────────────────────────────────────────── */
function StatusBadge({ active }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={active
        ? { background: "#DCFCE7", color: "#16A34A" }
        : { background: "#FEE2E2", color: "#DC2626" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#16A34A" : "#DC2626" }} />
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
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 font-gilroy">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FEE2E2" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-800">Referansı Sil</p>
            <p className="text-sm text-gray-500 mt-1">
              <strong>{name}</strong> referansı kalıcı olarak silinecek. Emin misiniz?
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold
                       transition-colors duration-150"
            style={{ borderColor: "#DDE9F8", color: "#1B3F84" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F9FF")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
            Vazgeç
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                       transition-colors duration-150"
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

/* ─── Form modalı ─────────────────────────────────────────────────────────── */
function ReferenceModal({ initial, onSave, onClose, saving }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(() => ({
    name:     initial?.name     ?? "",
    sector:   initial?.sector   ?? "",
    location: initial?.location ?? "",
    isActive: initial?.isActive ?? true,
    order:    initial?.order    ?? 0,
  }));
  const [logoFile, setLogoFile] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name",     form.name.trim());
    fd.append("sector",   form.sector.trim());
    fd.append("location", form.location.trim());
    fd.append("isActive", form.isActive);
    fd.append("order",    form.order);
    if (logoFile) fd.append("logo", logoFile);
    onSave(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg font-gilroy overflow-hidden">

        {/* Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE9F8]"
          style={{ background: "#F4F9FF" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "#1B3F84" }}>
              {isEdit ? "Referansı Düzenle" : "Yeni Referans Ekle"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Bilgileri güncelleyin." : "Yeni iş ortağı veya proje referansı ekleyin."}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#DDE9F8] transition-colors"
            style={{ color: "#4988C5" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Ad */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Firma / Proje Adı <span className="text-red-500">*</span>
            </label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Örn: Petkim A.Ş."
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
              style={{ borderColor: "#DDE9F8", color: "#1B3F84" }}
              onFocus={(e) => (e.target.style.borderColor = "#4988C5")}
              onBlur={(e)  => (e.target.style.borderColor = "#DDE9F8")} />
          </div>

          {/* Sektör & Lokasyon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>Sektör</label>
              <input value={form.sector} onChange={(e) => set("sector", e.target.value)}
                placeholder="Örn: Petrokimya"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "#DDE9F8", color: "#1B3F84" }}
                onFocus={(e) => (e.target.style.borderColor = "#4988C5")}
                onBlur={(e)  => (e.target.style.borderColor = "#DDE9F8")} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>Lokasyon</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                placeholder="Örn: İzmir, Türkiye"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "#DDE9F8", color: "#1B3F84" }}
                onFocus={(e) => (e.target.style.borderColor = "#4988C5")}
                onBlur={(e)  => (e.target.style.borderColor = "#DDE9F8")} />
            </div>
          </div>

          {/* Logo yükle */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Logo (PNG/SVG/WebP önerilir)
            </label>
            {isEdit && initial?.logoPath && !logoFile && (
              <div className="mb-2 flex items-center gap-2 p-2 rounded-lg border border-[#DDE9F8] bg-[#F4F9FF]">
                <img src={`${UPLOADS_BASE}/${initial.logoPath}`} alt="mevcut logo"
                  className="h-8 w-auto object-contain" />
                <span className="text-xs text-gray-400">Mevcut logo. Değiştirmek için yeni dosya seçin.</span>
              </div>
            )}
            <FileUploader
              accept="image/*"
              onFileSelect={(f) => setLogoFile(f)}
              label="Logo seçin veya sürükleyin"
            />
          </div>

          {/* Sıralama & Durum */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>Sıralama</label>
              <input type="number" min={0} value={form.order}
                onChange={(e) => set("order", Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "#DDE9F8", color: "#1B3F84" }}
                onFocus={(e) => (e.target.style.borderColor = "#4988C5")}
                onBlur={(e)  => (e.target.style.borderColor = "#DDE9F8")} />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 cursor-pointer pb-2.5">
                <div onClick={() => set("isActive", !form.isActive)}
                  className="relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer"
                  style={{ background: form.isActive ? "#1B3F84" : "#CBD5E1" }}>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow
                                  transition-transform duration-200"
                    style={{ transform: form.isActive ? "translateX(20px)" : "translateX(0)" }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "#1B3F84" }}>
                  {form.isActive ? "Aktif" : "Pasif"}
                </span>
              </label>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: "#DDE9F8", color: "#1B3F84" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F9FF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
              İptal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                         transition-colors disabled:opacity-60"
              style={{ background: "#1B3F84" }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.background = "#4988C5")}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.background = "#1B3F84")}>
              {saving ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function ReferencesAdminPage() {
  const [references, setReferences] = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [modal,      setModal]      = useState(null);   // null | "add" | row
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,      setToast]      = useState(null);

  /* ── Veri çek ───────────────────────────────────────────────────────────── */
  const fetchData = useCallback(() => {
    setIsLoading(true);
    getReferences({ limit: 200 })
      .then((res) => {
        const raw  = res?.data ?? res;
        const list = raw?.references ?? raw?.data ?? raw;
        setReferences(Array.isArray(list) ? list : []);
      })
      .catch(() => setReferences([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Toast ──────────────────────────────────────────────────────────────── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Kaydet (ekle / güncelle) ───────────────────────────────────────────── */
  const handleSave = async (fd) => {
    setSaving(true);
    try {
      if (modal?._id) {
        await updateReference(modal._id, fd);
        showToast("Referans güncellendi.");
      } else {
        await createReference(fd);
        showToast("Referans eklendi.");
      }
      setModal(null);
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message ?? "İşlem başarısız.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Sil ────────────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    try {
      await deleteReference(deleteTarget._id);
      showToast("Referans silindi.");
      setDeleteTarget(null);
      fetchData();
    } catch {
      showToast("Silme başarısız.", "error");
    }
  };

  /* ── Toggle durum ───────────────────────────────────────────────────────── */
  const handleToggle = async (row) => {
    try {
      await toggleReferenceStatus(row._id);
      fetchData();
    } catch {
      showToast("Durum değiştirilemedi.", "error");
    }
  };

  /* ── Tablo sütunları ────────────────────────────────────────────────────── */
  const columns = [
    {
      key: "logo",
      header: "Logo",
      render: (row) =>
        row.logoPath ? (
          <img src={`${UPLOADS_BASE}/${row.logoPath}`} alt={row.name}
            className="h-9 w-auto max-w-[80px] object-contain rounded" />
        ) : (
          <div className="w-10 h-9 rounded flex items-center justify-center text-[10px] font-bold"
            style={{ background: "#DDE9F8", color: "#4988C5" }}>
            {row.name?.charAt(0) ?? "?"}
          </div>
        ),
    },
    { key: "name",     header: "Firma / Proje Adı" },
    { key: "sector",   header: "Sektör",   render: (row) => row.sector   || "—" },
    { key: "location", header: "Lokasyon", render: (row) => row.location || "—" },
    { key: "order",    header: "Sıra",     render: (row) => row.order    ?? 0 },
    {
      key: "isActive",
      header: "Durum",
      render: (row) => <StatusBadge active={row.isActive} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* Toggle durum */}
          <IconBtn onClick={() => handleToggle(row)}
            title={row.isActive ? "Pasif yap" : "Aktif yap"}
            color={row.isActive ? "#16A34A" : "#94A3B8"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </IconBtn>
          {/* Düzenle */}
          <IconBtn onClick={() => setModal(row)} title="Düzenle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </IconBtn>
          {/* Sil */}
          <IconBtn onClick={() => setDeleteTarget(row)} title="Sil" color="#DC2626">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 font-gilroy">
      {/* ── Üst bar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1B3F84" }}>Referanslar</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {references.length} referans kayıtlı
          </p>
        </div>
        <button onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                     transition-colors duration-150"
          style={{ background: "#1B3F84" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4988C5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1B3F84")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Yeni Referans
        </button>
      </div>

      {/* ── Tablo ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#DDE9F8] overflow-hidden">
        <DataGrid
          columns={columns}
          data={references}
          isLoading={isLoading}
          emptyText="Henüz referans eklenmemiş."
          rowKey="_id"
        />
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3
                       rounded-xl shadow-xl text-sm font-semibold text-white"
            style={{ background: toast.type === "error" ? "#DC2626" : "#1B3F84" }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modaller ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <ReferenceModal
            key="ref-modal"
            initial={modal === "add" ? null : modal}
            onSave={handleSave}
            onClose={() => setModal(null)}
            saving={saving}
          />
        )}
        {deleteTarget && (
          <ConfirmModal
            key="confirm-modal"
            name={deleteTarget.name}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
