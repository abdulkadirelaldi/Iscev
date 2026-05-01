import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Toast bildirimi ─────────────────────────────────────────────────────── */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <AnimatePresence>
      <motion.div
        key={toast.msg}
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}
        className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5
                   rounded-2xl shadow-xl text-white text-sm font-semibold font-gilroy"
        style={{ background: isError ? "#DC2626" : "#1B3F84" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
          {isError
            ? <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
            : <polyline points="20 6 9 17 4 12"/>}
        </svg>
        {toast.msg}
        <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

import DataGrid     from "../../components/admin/DataGrid";
import FileUploader from "../../components/common/FileUploader";
import {
  getCatalogs,
  createCatalog,
  updateCatalog,
  deleteCatalog,
} from "../../api/catalog.api";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── PDF önizleme URL'i ──────────────────────────────────────────────────── */
const pdfUrl = (filePath) =>
  filePath ? `${UPLOADS_BASE}/${filePath}` : "#";

/* ─── Dil rozeti ──────────────────────────────────────────────────────────── */
function LangBadge({ lang }) {
  if (!lang) return null;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "#DDE9F8", color: "#1B3F84" }}
    >
      {lang.toUpperCase()}
    </span>
  );
}

/* ─── İkon buton ──────────────────────────────────────────────────────────── */
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

/* ─── Onay modal ──────────────────────────────────────────────────────────── */
function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{    scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 font-gilroy"
      >
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "#FEE2E2" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "#1B3F84" }}>
            Kataloğu Sil
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold">"{name}"</span> adlı kataloğu ve
            sunucudaki PDF dosyasını silmek istediğinize emin misiniz?
            <br />Bu işlem geri alınamaz.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                       text-gray-600 hover:bg-gray-50 transition-colors">
            Vazgeç
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                       transition-colors"
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

/* ─── Katalog form modal ──────────────────────────────────────────────────── */
function CatalogFormModal({ editTarget, onClose, onSaved }) {
  const isEdit = Boolean(editTarget);

  const [form, setForm]     = useState({
    name: editTarget?.name ?? "",
  });
  const [pdfFile,    setPdfFile]    = useState(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [formError,  setFormError]  = useState(null);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim())         return setFormError("Katalog adı zorunludur.");
    if (!isEdit && !pdfFile)       return setFormError("PDF dosyası zorunludur.");

    const fd = new FormData();
    fd.append("name", form.name.trim());
    if (pdfFile)          fd.append("pdf", pdfFile);

    setIsLoading(true);
    try {
      /* XHR progress için axios config ────────────────────────────────────── */
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      };

      if (isEdit) {
        await updateCatalog(editTarget._id, fd, config);
      } else {
        await createCatalog(fd, config);
      }
      onSaved();
    } catch (err) {
      setFormError(err.response?.data?.message ?? "Kayıt başarısız.");
    } finally {
      setIsLoading(false);
      setProgress(0);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md font-gilroy overflow-hidden"
      >
        {/* Başlık */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-[#1B3F84]/20"
          style={{ background: "#1B3F84" }}
        >
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 opacity-80">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h2 className="text-sm font-bold text-white">
              {isEdit ? "Katalog Düzenle" : "Yeni Katalog Yükle"}
            </h2>
          </div>
          <button onClick={onClose}
            className="text-white/60 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Katalog Adı */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
              Katalog Adı *
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="İSÇEV Ürün Kataloğu 2024" className={inputClass} />
          </div>


          {/* PDF Yükle */}
          <FileUploader
            accept="pdf"
            maxSizeMB={20}
            label={isEdit ? "Yeni PDF (mevcut dosyanın üzerine yazar)" : "PDF Dosyası *"}
            progress={progress}
            onChange={(files) => setPdfFile(files[0] ?? null)}
          />

          {/* Yükleme progress bar */}
          {isLoading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold" style={{ color: "#4988C5" }}>
                  Sunucuya yükleniyor…
                </span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: "#1B3F84" }}>
                  %{progress}
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#DDE9F8" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #1B3F84, #4988C5)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              {progress < 100 && (
                <p className="text-[10px] text-gray-400">
                  Büyük dosyalar için lütfen bekleyin, sayfayı kapatmayın.
                </p>
              )}
            </div>
          )}

          {/* Hata */}
          {formError && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {formError}
            </p>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                         text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40
                         disabled:cursor-not-allowed">
              İptal
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
                         transition-colors disabled:opacity-80 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              style={{ background: "#1B3F84" }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "#4988C5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1B3F84")}>
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {progress > 0 && progress < 100
                    ? `Yükleniyor… %${progress}`
                    : progress >= 100
                      ? "İşleniyor…"
                      : "Yükleniyor…"}
                </>
              ) : (
                isEdit ? "Güncelle" : "Yükle"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function CatalogsAdminPage() {
  const [catalogs,     setCatalogs]     = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search,       setSearch]       = useState("");
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Yükle ───────────────────────────────────────────────────────────────── */
  const fetchCatalogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCatalogs();
      const raw  = res?.data ?? res;
      const list = raw?.catalogs ?? raw?.data ?? raw;
      setCatalogs(Array.isArray(list) ? list : []);
    } catch {
      setCatalogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCatalogs(); }, [fetchCatalogs]);

  /* ── Sil ─────────────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCatalog(deleteTarget._id);
      setDeleteTarget(null);
      fetchCatalogs();
      showToast("Katalog silindi.");
    } catch {
      showToast("Katalog silinemedi.", "error");
    }
  };

  /* ── Filtre ──────────────────────────────────────────────────────────────── */
  const filtered = Array.isArray(catalogs)
    ? catalogs.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()))
    : [];

  /* ── Tablo sütunları ─────────────────────────────────────────────────────── */
  const columns = [
    {
      key:    "icon",
      header: "",
      width:  "52px",
      render: () => (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#1B3F84" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
      ),
    },
    {
      key:    "name",
      header: "Katalog Adı",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px]" style={{ color: "#1B3F84" }}>
            {row.name}
          </span>
          <LangBadge lang={row.lang} />
        </div>
      ),
    },
    {
      key:    "fileSize",
      header: "Dosya Boyutu",
      noWrap: true,
      render: (row) =>
        row.fileSize
          ? `${(row.fileSize / (1024 * 1024)).toFixed(1)} MB`
          : "—",
    },
    {
      key:    "createdAt",
      header: "Yüklenme Tarihi",
      noWrap: true,
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("tr-TR", {
              day: "2-digit", month: "long", year: "numeric",
            })
          : "—",
    },
    {
      key:    "actions",
      header: "",
      align:  "right",
      noWrap: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* Görüntüle */}
          <IconBtn
            onClick={() => window.open(pdfUrl(row.filePath), "_blank")}
            title="PDF'i Görüntüle"
            color="#4988C5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </IconBtn>

          {/* Düzenle */}
          <IconBtn
            onClick={() => { setEditTarget(row); setShowForm(true); }}
            title="Düzenle"
            color="#4988C5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </IconBtn>

          {/* Sil */}
          <IconBtn
            onClick={() => setDeleteTarget(row)}
            title="Sil"
            color="#EF4444"
          >
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
    <>
    <Toast toast={toast} onClose={() => setToast(null)} />
    <div className="space-y-5 font-gilroy">

      {/* ── Üst Bar ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1B3F84" }}>
            Katalog Yönetimi
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isLoading ? "Yükleniyor…" : `${filtered.length} katalog listeleniyor`}
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
              placeholder="Katalog ara…"
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#4988C5]
                         transition-all duration-150 w-44"
            />
          </div>

          {/* Yeni Katalog Yükle */}
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
            Yeni Katalog Yükle
          </button>
        </div>
      </div>

      {/* ── DataGrid ─────────────────────────────────────────────────────────── */}
      <DataGrid
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyText="Henüz katalog yüklenmemiş. Yeni katalog eklemek için butona tıklayın."
      />

      {/* ── Modaller ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <CatalogFormModal
            editTarget={editTarget}
            onClose={() => { setShowForm(false); setEditTarget(null); }}
            onSaved={() => {
              setShowForm(false);
              setEditTarget(null);
              fetchCatalogs();
              showToast(editTarget ? "Katalog güncellendi." : "Katalog başarıyla yüklendi.");
            }}
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
    </>
  );
}
