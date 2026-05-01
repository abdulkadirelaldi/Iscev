import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DataGrid from "../../components/admin/DataGrid";
import {
  getAllMapLocations,
  createMapLocation,
  updateMapLocation,
  deleteMapLocation,
} from "../../api/mapLocation.api";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Yardımcı: koordinat ayrıştırıcı ────────────────────────────────────── */
const getLat = (loc) => loc?.location?.coordinates?.[1] ?? "";
const getLng = (loc) => loc?.location?.coordinates?.[0] ?? "";

/* ─── Durum rozeti ────────────────────────────────────────────────────────── */
function StatusBadge({ active }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={active
        ? { background: "#DCFCE7", color: "#16A34A" }
        : { background: "#FEE2E2", color: "#DC2626" }}>
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
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
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
            <p className="font-bold text-gray-800">Lokasyonu Sil</p>
            <p className="text-sm text-gray-500 mt-1">
              <strong>{name}</strong> kalıcı olarak silinecek. Emin misiniz?
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

/* ─── Input bileşeni ──────────────────────────────────────────────────────── */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#1B3F84" }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors font-gilroy";
const inputStyle = { borderColor: "#DDE9F8", color: "#1B3F84" };
const onFocus = (e) => (e.target.style.borderColor = "#4988C5");
const onBlur  = (e) => (e.target.style.borderColor = "#DDE9F8");

/* ─── Form modalı ─────────────────────────────────────────────────────────── */
function LocationModal({ initial, onSave, onClose, saving }) {
  const isEdit = !!initial?._id;

  const [form, setForm] = useState({
    projectName: initial?.projectName ?? "",
    description: initial?.description ?? "",
    country:     initial?.country     ?? "",
    latitude:    isEdit ? getLat(initial) : "",
    longitude:   isEdit ? getLng(initial) : "",
    isActive:    initial?.isActive    ?? true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [coordErr,  setCoordErr]  = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validateCoords = () => {
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90  || lat > 90)  return "Enlem -90 ile 90 arasında olmalıdır.";
    if (isNaN(lng) || lng < -180 || lng > 180) return "Boylam -180 ile 180 arasında olmalıdır.";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateCoords();
    if (err) { setCoordErr(err); return; }
    setCoordErr("");

    const fd = new FormData();
    fd.append("projectName", form.projectName.trim());
    fd.append("description", form.description.trim());
    fd.append("country",     form.country.trim());
    fd.append("latitude",    parseFloat(form.latitude));
    fd.append("longitude",   parseFloat(form.longitude));
    fd.append("isActive",    form.isActive);
    if (imageFile) fd.append("image", imageFile);
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
              {isEdit ? "Lokasyonu Düzenle" : "Yeni Lokasyon Ekle"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Bilgileri güncelleyin." : "Haritaya yeni proje pini ekleyin."}
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#DDE9F8] transition-colors"
            style={{ color: "#4988C5" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Proje Adı */}
          <Field label="Proje / Santral Adı" required>
            <input required value={form.projectName}
              onChange={(e) => set("projectName", e.target.value)}
              placeholder="Örn: Riyad Su Geri Kazanım Tesisi"
              className={inputCls} style={inputStyle}
              onFocus={onFocus} onBlur={onBlur} />
          </Field>

          {/* Ülke */}
          <Field label="Ülke">
            <input value={form.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="Örn: Suudi Arabistan"
              className={inputCls} style={inputStyle}
              onFocus={onFocus} onBlur={onBlur} />
          </Field>

          {/* Koordinatlar */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Enlem (Latitude)" required>
              <input required type="number" step="any"
                value={form.latitude}
                onChange={(e) => { set("latitude", e.target.value); setCoordErr(""); }}
                placeholder="Örn: 24.6877"
                className={inputCls} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur} />
            </Field>
            <Field label="Boylam (Longitude)" required>
              <input required type="number" step="any"
                value={form.longitude}
                onChange={(e) => { set("longitude", e.target.value); setCoordErr(""); }}
                placeholder="Örn: 46.7219"
                className={inputCls} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur} />
            </Field>
          </div>

          {/* Koordinat uyarısı */}
          {coordErr && (
            <p className="text-xs font-semibold text-red-500 -mt-1">{coordErr}</p>
          )}

          {/* Koordinat yardım notu */}
          <p className="text-[11px] text-gray-400 -mt-2 leading-relaxed">
            Google Maps'te bir noktaya sağ tıklayarak koordinatları kopyalayabilirsiniz.
            Format: <span className="font-mono">Enlem, Boylam</span>
          </p>

          {/* Açıklama */}
          <Field label="Açıklama">
            <textarea value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Proje hakkında kısa bilgi…"
              rows={3}
              className={`${inputCls} resize-none`} style={inputStyle}
              onFocus={onFocus} onBlur={onBlur} />
          </Field>

          {/* Görsel */}
          <Field label="Proje Görseli (opsiyonel)">
            {isEdit && initial?.imageFilePath && !imageFile && (
              <div className="mb-2 flex items-center gap-2 p-2 rounded-lg border border-[#DDE9F8] bg-[#F4F9FF]">
                <img src={`${UPLOADS_BASE}/${initial.imageFilePath}`} alt="mevcut"
                  className="h-10 w-auto object-contain rounded" />
                <span className="text-xs text-gray-400">Mevcut görsel. Değiştirmek için yeni seçin.</span>
              </div>
            )}
            <label className="flex flex-col items-center justify-center gap-2 w-full py-5 rounded-xl
                              border-2 border-dashed cursor-pointer transition-colors duration-150"
              style={{ borderColor: imageFile ? "#4988C5" : "#DDE9F8",
                       background: imageFile ? "#F4F9FF" : "white" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="text-xs text-gray-500">
                {imageFile ? imageFile.name : "Görsel seçin veya sürükleyin"}
              </span>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </label>
          </Field>

          {/* Durum toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => set("isActive", !form.isActive)}
              className="relative w-10 h-5 rounded-full transition-colors duration-200"
              style={{ background: form.isActive ? "#1B3F84" : "#CBD5E1" }}>
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow
                              transition-transform duration-200"
                style={{ transform: form.isActive ? "translateX(20px)" : "translateX(0)" }} />
            </button>
            <span className="text-xs font-semibold" style={{ color: "#1B3F84" }}>
              {form.isActive ? "Haritada Aktif" : "Haritada Pasif"}
            </span>
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
              {saving ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Pini Ekle"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Harita mini önizlemesi (pin konumunu göster) ────────────────────────── */
function CoordBadge({ loc }) {
  const lat = getLat(loc);
  const lng = getLng(loc);
  if (!lat && !lng) return <span className="text-gray-300">—</span>;
  return (
    <span className="font-mono text-[11px]" style={{ color: "#4988C5" }}>
      {Number(lat).toFixed(3)}, {Number(lng).toFixed(3)}
    </span>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function MapAdminPage() {
  const [locations,    setLocations]    = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [modal,        setModal]        = useState(null);   // null | "add" | row
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast,        setToast]        = useState(null);

  /* ── Veri çek ─────────────────────────────────────────────────────────── */
  const fetchData = useCallback(() => {
    setIsLoading(true);
    getAllMapLocations()
      .then((res) => {
        const raw  = res?.data?.data ?? res?.data ?? res;
        const list = raw?.locations ?? raw?.data ?? raw;
        setLocations(Array.isArray(list) ? list : []);
      })
      .catch(() => setLocations([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Toast ────────────────────────────────────────────────────────────── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Kaydet ───────────────────────────────────────────────────────────── */
  const handleSave = async (fd) => {
    setSaving(true);
    try {
      if (modal?._id) {
        await updateMapLocation(modal._id, fd);
        showToast("Lokasyon güncellendi.");
      } else {
        await createMapLocation(fd);
        showToast("Lokasyon eklendi.");
      }
      setModal(null);
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message ?? "İşlem başarısız.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Sil ──────────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    try {
      await deleteMapLocation(deleteTarget._id);
      showToast("Lokasyon silindi.");
      setDeleteTarget(null);
      fetchData();
    } catch {
      showToast("Silme başarısız.", "error");
    }
  };

  /* ── Tablo sütunları ──────────────────────────────────────────────────── */
  const columns = [
    {
      key: "preview",
      header: "Görsel",
      render: (row) =>
        row.imageFilePath ? (
          <img src={`${UPLOADS_BASE}/${row.imageFilePath}`} alt={row.projectName}
            className="h-10 w-14 object-cover rounded-lg" />
        ) : (
          <div className="w-14 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#DDE9F8" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            </svg>
          </div>
        ),
    },
    { key: "projectName", header: "Proje / Santral Adı" },
    { key: "country",     header: "Ülke", render: (row) => row.country || "—" },
    { key: "coords",      header: "Koordinatlar", render: (row) => <CoordBadge loc={row} /> },
    { key: "isActive",    header: "Durum",        render: (row) => <StatusBadge active={row.isActive} /> },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
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

  /* ── Özet sayaçlar ────────────────────────────────────────────────────── */
  const activeCount  = Array.isArray(locations) ? locations.filter((l) => l.isActive).length  : 0;
  const passiveCount = Array.isArray(locations) ? locations.filter((l) => !l.isActive).length : 0;

  return (
    <div className="p-6 space-y-6 font-gilroy">

      {/* ── Üst bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1B3F84" }}>Harita Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Dünya haritasındaki proje pinlerini yönetin.
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
          Yeni Lokasyon
        </button>
      </div>

      {/* ── Özet kartlar ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Pin",   val: locations.length, color: "#1B3F84", bg: "#DDE9F8" },
          { label: "Aktif",        val: activeCount,       color: "#16A34A", bg: "#DCFCE7" },
          { label: "Pasif",        val: passiveCount,      color: "#DC2626", bg: "#FEE2E2" },
        ].map(({ label, val, color, bg: _bg }) => (
          <div key={label} className="rounded-2xl border border-[#DDE9F8] bg-white p-5">
            <p className="text-2xl font-bold font-gilroy" style={{ color }}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Tablo ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#DDE9F8] overflow-hidden">
        <DataGrid
          columns={columns}
          data={locations}
          isLoading={isLoading}
          emptyText="Henüz harita pini eklenmemiş."
          rowKey="_id"
        />
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
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

      {/* ── Modaller ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <LocationModal
            key="loc-modal"
            initial={modal === "add" ? null : modal}
            onSave={handleSave}
            onClose={() => setModal(null)}
            saving={saving}
          />
        )}
        {deleteTarget && (
          <ConfirmModal
            key="confirm-modal"
            name={deleteTarget.projectName}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
