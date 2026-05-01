import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategories, createCategory, deleteCategory } from "../../api/category.api";

/* ─── Onay Modalı ─────────────────────────────────────────────────────────── */
function ConfirmModal({ category, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 font-gilroy"
      >
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "#FEE2E2" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Kategoriyi Sil
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold" style={{ color: "#1B3F84" }}>
                "{category.name}"
              </span>{" "}
              kategorisini silmek istediğinize emin misiniz?
              Bağlı ürün varsa bu işlem reddedilir.
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

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function CategoriesAdminPage() {
  const [categories,   setCategories]   = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [newName,      setNewName]      = useState("");
  const [addLoading,   setAddLoading]   = useState(false);
  const [addError,     setAddError]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError,  setDeleteError]  = useState(null);
  const inputRef = useRef(null);

  /* ── Veri yükle ────────────────────────────────────────────────────────── */
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getCategories();
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ── Kategori ekle ─────────────────────────────────────────────────────── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError(null);
    const trimmed = newName.trim();
    if (!trimmed) return setAddError("Kategori adı boş olamaz.");

    setAddLoading(true);
    try {
      const created = await createCategory({ name: trimmed });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "tr")));
      setNewName("");
      inputRef.current?.focus();
    } catch (err) {
      setAddError(err?.response?.data?.message ?? "Eklenemedi, tekrar deneyin.");
    } finally {
      setAddLoading(false);
    }
  };

  /* ── Kategori sil ──────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteCategory(deleteTarget._id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err?.response?.data?.message ?? "Silinemedi.");
      setDeleteTarget(null);
    }
  };

  /* ── Skeleton ──────────────────────────────────────────────────────────── */
  const Skeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 font-gilroy max-w-2xl">

      {/* ── Başlık ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#1B3F84" }}>
          Kategori Yönetimi
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Ürün ve hizmetler için kategori ekle, listele veya sil.
        </p>
      </div>

      {/* ── Yeni Kategori Formu ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#DDE9F8] overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#DDE9F8]"
          style={{ background: "#F8FBFF" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#1B3F84" }}>
            Yeni Kategori Ekle
          </h2>
        </div>
        <form onSubmit={handleAdd} className="px-5 py-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError(null); }}
                placeholder="Kategori adı (örn: Arıtma Sistemleri)"
                className="w-full px-4 py-2.5 rounded-xl border text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#4988C5]/30
                           focus:border-[#4988C5] transition-all duration-150
                           placeholder:text-gray-300"
                style={{ borderColor: addError ? "#EF4444" : "#DDE9F8" }}
              />
              {addError && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{addError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         text-white transition-all duration-150 shrink-0
                         disabled:opacity-60 hover:opacity-90"
              style={{ background: "#1B3F84" }}
            >
              {addLoading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
              Ekle
            </button>
          </div>
        </form>
      </div>

      {/* ── Silme Hatası ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#FEE2E2", color: "#B91C1C" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{deleteError}</span>
            <button onClick={() => setDeleteError(null)}
              className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Kategori Listesi ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#DDE9F8] overflow-hidden shadow-sm">
        {/* Tablo başlığı */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[#DDE9F8]"
          style={{ background: "#1B3F84" }}>
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Kategori Adı
          </span>
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            İşlemler
          </span>
        </div>

        {isLoading ? (
          <div className="p-5"><Skeleton /></div>
        ) : categories.length === 0 ? (
          <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "#DDE9F8" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">
              Henüz kategori eklenmemiş.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0F6FF]">
            <AnimatePresence initial={false}>
              {categories.map((cat, i) => (
                <motion.li
                  key={cat._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="flex items-center justify-between px-5 py-3.5
                             hover:bg-[#F8FBFF] transition-colors duration-100 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Renk göstergesi */}
                    <div className="w-1.5 h-6 rounded-full shrink-0"
                      style={{ background: "#DDE9F8" }} />
                    <span className="text-sm font-medium" style={{ color: "#1B3F84" }}>
                      {cat.name}
                    </span>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(cat)}
                    title="Kategoriyi Sil"
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                               transition-all duration-150"
                    style={{ color: "#EF4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {/* Alt bilgi */}
        {!isLoading && categories.length > 0 && (
          <div className="px-5 py-2.5 border-t border-[#F0F6FF]"
            style={{ background: "#F8FBFF" }}>
            <p className="text-[11px] text-gray-400">
              Toplam{" "}
              <span className="font-semibold" style={{ color: "#1B3F84" }}>
                {categories.length}
              </span>{" "}
              kategori · Bağlı ürünü olan kategoriler silinemez
            </p>
          </div>
        )}
      </div>

      {/* ── Onay Modalı ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            category={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
