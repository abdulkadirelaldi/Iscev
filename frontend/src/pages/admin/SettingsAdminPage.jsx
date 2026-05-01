import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import FileUploader from "../../components/common/FileUploader";
import api from "../../api/axiosInstance";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Sekme bileşeni ──────────────────────────────────────────────────────── */
function Tab({ id, label, icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl
                 transition-all duration-200 whitespace-nowrap"
      style={
        active
          ? { background: "#1B3F84", color: "#fff" }
          : { background: "transparent", color: "#4988C5" }
      }
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d={icon} />
      </svg>
      {label}
    </button>
  );
}

/* ─── Input alanı ─────────────────────────────────────────────────────────── */
function Field({ label, id, type = "text", value, onChange, placeholder, prefix }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold" style={{ color: "#1B3F84" }}>
        {label}
      </label>
      <div className="relative flex">
        {prefix && (
          <span
            className="flex items-center px-3 text-xs font-medium rounded-l-xl border-y border-l shrink-0"
            style={{ borderColor: "#DDE9F8", background: "#F0F7FF", color: "#4988C5" }}
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={[
            "flex-1 px-4 py-3 text-sm text-gray-700 bg-white",
            "border border-[#DDE9F8] outline-none",
            "placeholder:text-gray-300 transition-all duration-150",
            "focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]",
            prefix ? "rounded-r-xl border-l-0" : "rounded-xl",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/* ─── Bölüm başlığı ───────────────────────────────────────────────────────── */
function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-[#F0F6FF]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "#DDE9F8" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d={icon} />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-gilroy font-bold" style={{ color: "#1B3F84" }}>{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Kaydet butonu ───────────────────────────────────────────────────────── */
function SaveBtn({ loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white
                 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      style={{ background: "linear-gradient(90deg, #1B3F84, #4988C5)" }}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Kaydediliyor…
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Değişiklikleri Kaydet
        </>
      )}
    </button>
  );
}

/* ─── Toast bildirimi ─────────────────────────────────────────────────────── */
function Toast({ message, type = "success", onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
                     rounded-2xl shadow-xl text-white text-sm font-semibold"
          style={{ background: type === "error" ? "#DC2626" : "#1B3F84" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#DDE9F8]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {message}
          <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Carousel görsel kartı (kullanılmıyor — DraggableSlideRow ile değiştirildi) ── */
// eslint-disable-next-line no-unused-vars
function CarouselThumb({ item, onDelete, onUpdate }) {
  const src = item.imagePath ? `${UPLOADS_BASE}/${item.imagePath}` : null;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title ?? "");
  const [editSub,   setEditSub]   = useState(item.subtitle ?? "");
  const [saving,    setSaving]    = useState(false);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/site-settings/carousel/${item._id}`, {
        title:    editTitle.trim(),
        subtitle: editSub.trim(),
      });
      onUpdate(item._id, { title: editTitle.trim(), subtitle: editSub.trim() });
      setIsEditing(false);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-xl border border-[#DDE9F8] overflow-hidden bg-white">
      {/* Görsel */}
      <div className="relative aspect-video bg-[#F0F7FF] group">
        {src ? (
          <img src={src} alt={item.title || `Slayt ${item.order}`}
            className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1 opacity-30">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-[10px] font-semibold text-[#1B3F84]">Slayt {item.order}</p>
          </div>
        )}

        {/* Sil overlay */}
        <button
          onClick={() => onDelete(item._id)}
          className="absolute inset-0 flex items-center justify-center opacity-0
                     group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(27,63,132,0.55)" }}
        >
          <div className="flex flex-col items-center gap-1 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
            <span className="text-[10px] font-bold">Sil</span>
          </div>
        </button>

        {/* Sıra rozeti */}
        <span className="absolute top-2 left-2 w-5 h-5 rounded-full text-[10px] font-bold
                         flex items-center justify-center pointer-events-none"
          style={{ background: "#1B3F84", color: "#fff" }}>
          {item.order}
        </span>
      </div>

      {/* Başlık / Altyazı */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-xs font-bold truncate" style={{ color: "#1B3F84" }}>
          {item.title || <span className="text-gray-300 font-normal">Başlık yok</span>}
        </p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">
          {item.subtitle || ""}
        </p>
      </div>

      {/* Düzenle / Inline form */}
      {!isEditing ? (
        <div className="px-3 pb-3 pt-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-[11px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "#4988C5" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Düzenle
          </button>
        </div>
      ) : (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[#F0F6FF] mt-1">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Başlık"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#DDE9F8] outline-none
                       focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5] text-gray-700"
          />
          <input
            value={editSub}
            onChange={(e) => setEditSub(e.target.value)}
            placeholder="Alt başlık"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#DDE9F8] outline-none
                       focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5] text-gray-700"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white
                         disabled:opacity-60 transition-opacity"
              style={{ background: "#1B3F84" }}
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditTitle(item.title ?? ""); setEditSub(item.subtitle ?? ""); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-[#DDE9F8]
                         transition-colors hover:bg-[#F0F6FF]"
              style={{ color: "#4988C5" }}
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── SEKMELİ BÖLÜMLER ─────────────────────────────────────────────────────  */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. İletişim Ayarları ─────────────────────────────────────────────────── */
function ContactSettingsSection({ onSave }) {
  const [form, setForm] = useState({
    address:   "",
    phone:     "",
    email:     "",
    whatsapp:  "",
    linkedin:  "",
    instagram: "",
  });
  const [loading, setLoading] = useState(false);

  /* ── API'den mevcut bilgileri çek ──────────────────────────────────────── */
  useEffect(() => {
    api.get("/site-settings")
      .then((r) => {
        const raw  = r?.data ?? r;
        const info = raw?.data?.contactInfo ?? raw?.contactInfo ?? null;
        if (!info) return;
        setForm({
          address:   info.address         ?? "",
          phone:     info.phone           ?? "",
          email:     info.email           ?? "",
          whatsapp:  info.whatsappNumber  ?? "",
          linkedin:  info.linkedinUrl     ?? "",
          instagram: info.instagramUrl    ?? "",
        });
      })
      .catch(() => {});
  }, []);

  const handle = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/site-settings/contact", {
        address:        form.address,
        phone:          form.phone,
        email:          form.email,
        whatsappNumber: form.whatsapp,
        linkedinUrl:    form.linkedin,
        instagramUrl:   form.instagram,
      });
      onSave("İletişim bilgileri başarıyla kaydedildi.");
    } catch (err) {
      onSave(err?.response?.data?.message ?? "Kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z"
        title="İletişim Bilgileri"
        subtitle="Siteye yansıyacak adres, telefon ve sosyal medya bağlantıları."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Field id="address" label="Şirket Adresi" value={form.address}
            onChange={handle("address")} placeholder="Açık adres…" />
        </div>
        <Field id="phone" label="Telefon" type="tel" value={form.phone}
          onChange={handle("phone")} placeholder="+90 (212) 000 00 00" />
        <Field id="email" label="E-posta" type="email" value={form.email}
          onChange={handle("email")} placeholder="info@sirket.com" />
        <Field id="whatsapp" label="WhatsApp Numarası" value={form.whatsapp}
          onChange={handle("whatsapp")} placeholder="+905xxxxxxxxx" prefix="+90" />
      </div>

      <div className="pt-2">
        <p className="text-xs font-semibold mb-3" style={{ color: "#1B3F84" }}>Sosyal Medya</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field id="linkedin" label="LinkedIn URL" value={form.linkedin}
            onChange={handle("linkedin")} placeholder="https://linkedin.com/company/…" prefix="in/" />
          <Field id="instagram" label="Instagram URL" value={form.instagram}
            onChange={handle("instagram")} placeholder="https://instagram.com/…" prefix="@" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <SaveBtn loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ─── Sürüklenebilir Slayt Satırı ────────────────────────────────────────── */
function DraggableSlideRow({ item, onDelete, onUpdate }) {
  const controls   = useDragControls();
  const src        = item.imagePath ? `${UPLOADS_BASE}/${item.imagePath}` : null;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title ?? "");
  const [editSub,   setEditSub]   = useState(item.subtitle ?? "");
  const [saving,    setSaving]    = useState(false);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/site-settings/carousel/${item._id}`, {
        title:    editTitle.trim(),
        subtitle: editSub.trim(),
      });
      onUpdate(item._id, { title: editTitle.trim(), subtitle: editSub.trim() });
      setIsEditing(false);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="rounded-xl border border-[#DDE9F8] bg-white overflow-hidden select-none"
      style={{ cursor: "default" }}
    >
      <div className="flex items-stretch gap-0">
        {/* Drag handle */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="flex items-center justify-center px-3 shrink-0 cursor-grab active:cursor-grabbing
                     border-r border-[#F0F6FF] transition-colors hover:bg-[#F4F9FF]"
          title="Sürükleyerek sırala"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="9" y1="6" x2="9" y2="6" strokeWidth="3" /><line x1="15" y1="6" x2="15" y2="6" strokeWidth="3" />
            <line x1="9" y1="12" x2="9" y2="12" strokeWidth="3" /><line x1="15" y1="12" x2="15" y2="12" strokeWidth="3" />
            <line x1="9" y1="18" x2="9" y2="18" strokeWidth="3" /><line x1="15" y1="18" x2="15" y2="18" strokeWidth="3" />
          </svg>
        </div>

        {/* Küçük önizleme */}
        <div className="shrink-0 w-24 h-16 bg-[#F0F7FF] overflow-hidden">
          {src
            ? <img src={src} alt={item.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 opacity-40">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
          }
        </div>

        {/* Metin */}
        <div className="flex-1 min-w-0 px-4 py-3">
          {isEditing ? (
            <div className="space-y-2">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Başlık"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#DDE9F8] outline-none
                           focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5] text-gray-700" />
              <input value={editSub} onChange={(e) => setEditSub(e.target.value)}
                placeholder="Alt başlık"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#DDE9F8] outline-none
                           focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5] text-gray-700" />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} disabled={saving}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold text-white disabled:opacity-60"
                  style={{ background: "#1B3F84" }}>
                  {saving ? "…" : "Kaydet"}
                </button>
                <button onClick={() => { setIsEditing(false); setEditTitle(item.title ?? ""); setEditSub(item.subtitle ?? ""); }}
                  className="px-3 py-1 rounded-lg text-[11px] border border-[#DDE9F8]"
                  style={{ color: "#4988C5" }}>
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold truncate" style={{ color: "#1B3F84" }}>
                {item.title || <span className="text-gray-300 font-normal italic">Başlık yok</span>}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.subtitle || ""}</p>
            </>
          )}
        </div>

        {/* Aksiyonlar */}
        {!isEditing && (
          <div className="flex items-center gap-1 px-3 shrink-0">
            <button onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[#DDE9F8]"
              title="Düzenle">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={() => onDelete(item._id)}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
              title="Sil">
              <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

/* ── 2. Medya Ayarları (Carousel) ─────────────────────────────────────────── */
function MediaSettingsSection({ onSave }) {
  const [slides,      setSlides]      = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newTitle,    setNewTitle]    = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  /* ── Mevcut slaytları çek ────────────────────────────────────────────── */
  useEffect(() => {
    api.get("/site-settings")
      .then((r) => {
        const raw  = r?.data ?? r;
        const list = raw?.data?.carousel ?? raw?.carousel ?? raw?.data?.settings?.carousel ?? [];
        setSlides(Array.isArray(list) ? [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []);
      })
      .catch(() => {});
  }, []);

  /* ── Slayt sil ───────────────────────────────────────────────────────── */
  const handleDeleteSlide = useCallback(async (id) => {
    try {
      await api.delete(`/site-settings/carousel/${id}`);
      setSlides((prev) => prev.filter((s) => s._id !== id));
      onSave("Slayt silindi.");
    } catch {
      onSave("Slayt silinemedi.");
    }
  }, [onSave]);

  /* ── Slayt güncelle (inline edit) ───────────────────────────────────── */
  const handleUpdateSlide = useCallback((id, updates) => {
    setSlides((prev) => prev.map((s) => s._id === id ? { ...s, ...updates } : s));
    onSave("Slayt güncellendi.");
  }, [onSave]);

  /* ── Sıra kaydet ─────────────────────────────────────────────────────── */
  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      await Promise.all(
        slides.map((slide, i) =>
          api.patch(`/site-settings/carousel/${slide._id}`, { order: i + 1 })
        )
      );
      setSlides((prev) => prev.map((s, i) => ({ ...s, order: i + 1 })));
      onSave("Sıralama kaydedildi.");
    } catch {
      onSave("Sıralama kaydedilemedi.");
    } finally {
      setSavingOrder(false);
    }
  };

  /* ── Yeni slayt ekle ─────────────────────────────────────────────────── */
  const handleAddSlide = async () => {
    if (!uploadFiles[0]) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("carouselImages", uploadFiles[0]);
      fd.append("titles[0]",    newTitle.trim());
      fd.append("subtitles[0]", newSubtitle.trim());
      const res  = await api.post("/site-settings/carousel", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const raw  = res?.data ?? res;
      const list = raw?.data?.carousel ?? raw?.carousel ?? raw?.data?.settings?.carousel ?? [];
      if (Array.isArray(list) && list.length > 0) {
        setSlides([...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      }
      onSave("Yeni slayt eklendi.");
      setUploadFiles([]);
      setNewTitle("");
      setNewSubtitle("");
    } catch (err) {
      onSave(err?.response?.data?.message ?? "Slayt eklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        icon="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
        title="Ana Sayfa Carousel"
        subtitle="Slaytları sürükleyerek sırala. Düzenle veya sil."
      />

      {/* Sürüklenebilir slayt listesi */}
      {slides.length > 0 ? (
        <>
          <Reorder.Group
            axis="y"
            values={slides}
            onReorder={setSlides}
            className="space-y-2"
          >
            {slides.map((item) => (
              <DraggableSlideRow
                key={item._id}
                item={item}
                onDelete={handleDeleteSlide}
                onUpdate={handleUpdateSlide}
              />
            ))}
          </Reorder.Group>

          {/* Sırayı kaydet */}
          <div className="flex items-center justify-between rounded-xl border border-[#DDE9F8] px-4 py-3"
            style={{ background: "#F8FBFF" }}>
            <p className="text-xs text-gray-400">
              Sıralamayı değiştirdikten sonra kaydedin.
            </p>
            <button
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white
                         transition-all disabled:opacity-60"
              style={{ background: "#1B3F84" }}
            >
              {savingOrder ? "Kaydediliyor…" : "Sırayı Kaydet"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">Henüz slayt yüklenmedi.</p>
      )}

      {/* Yeni slayt ekle formu */}
      <div className="rounded-2xl border border-[#DDE9F8] p-5 space-y-4"
        style={{ background: "#F8FBFF" }}>
        <p className="text-xs font-semibold" style={{ color: "#1B3F84" }}>Yeni Slayt Ekle</p>
        <FileUploader
          accept="image"
          multiple={false}
          maxSizeMB={5}
          label="Görsel seç veya sürükleyin (JPG, PNG, WEBP — maks. 5 MB)"
          onChange={(files) => setUploadFiles(files)}
        />
        <Field
          id="newTitle"
          label="Başlık"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Örn: Endüstriyel Su Arıtma'da Global Güç"
        />
        <Field
          id="newSubtitle"
          label="Alt Başlık"
          value={newSubtitle}
          onChange={(e) => setNewSubtitle(e.target.value)}
          placeholder="Kısa açıklama…"
        />
        {uploadFiles.length > 0 && (
          <div className="flex justify-end">
            <SaveBtn loading={isLoading} onClick={handleAddSlide} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 3. Kurumsal İçerik ───────────────────────────────────────────────────── */
const EMPTY_STATS = [
  { value: "", label: "" },
  { value: "", label: "" },
  { value: "", label: "" },
  { value: "", label: "" },
];

function CorporateSettingsSection({ onSave }) {
  const [form, setForm] = useState({
    subtitle: "",
    title:    "",
    bodyText: "",
    stats:    EMPTY_STATS,
  });
  const [loading, setLoading] = useState(false);

  /* ── API'den mevcut kurumsal içeriği çek ─────────────────────────────── */
  useEffect(() => {
    api.get("/site-settings")
      .then((r) => {
        const raw  = r?.data ?? r;
        const corp = raw?.data?.corporateSection ?? raw?.corporateSection ?? null;
        if (!corp) return;

        const rawStats = Array.isArray(corp.stats) ? corp.stats : [];
        const stats = Array.from({ length: 4 }, (_, i) => ({
          value: rawStats[i]?.value ?? "",
          label: rawStats[i]?.label ?? "",
        }));

        setForm({
          subtitle: corp.subtitle ?? "",
          title:    corp.title    ?? "",
          bodyText: corp.bodyText ?? "",
          stats,
        });
      })
      .catch(() => {});
  }, []);

  const handle = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleStat = (i, key) => (e) => {
    setForm((p) => {
      const stats = [...p.stats];
      stats[i] = { ...stats[i], [key]: e.target.value };
      return { ...p, stats };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/site-settings/corporate", {
        subtitle: form.subtitle,
        title:    form.title,
        bodyText: form.bodyText,
        stats:    form.stats,
      });
      onSave("Kurumsal içerik başarıyla kaydedildi.");
    } catch (err) {
      onSave(err?.response?.data?.message ?? "Kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5m4 0H9"
        title="Kurumsal İçerik"
        subtitle="Ana sayfanın 'Kurumsal Vizyon' bölümündeki metin ve istatistikleri düzenleyin."
      />

      {/* Üst etiket + Ana başlık */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          id="corp-subtitle"
          label="Üst Etiket"
          value={form.subtitle}
          onChange={handle("subtitle")}
          placeholder="Örn: Kurumsal Vizyonumuz"
        />
        <Field
          id="corp-title"
          label="Ana Başlık"
          value={form.title}
          onChange={handle("title")}
          placeholder="Örn: Su Kaynaklarını Geleceğe Taşıyan Teknoloji"
        />
      </div>

      {/* Paragraf metni */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="corp-body" className="text-xs font-semibold" style={{ color: "#1B3F84" }}>
          Paragraf Metni
        </label>
        <textarea
          id="corp-body"
          rows={5}
          value={form.bodyText}
          onChange={handle("bodyText")}
          placeholder="Şirket tanıtım paragrafı…"
          className="px-4 py-3 text-sm text-gray-700 bg-white border border-[#DDE9F8] rounded-xl
                     outline-none placeholder:text-gray-300 resize-y transition-all duration-150
                     focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]"
        />
      </div>

      {/* İstatistikler */}
      <div>
        <p className="text-xs font-semibold mb-3" style={{ color: "#1B3F84" }}>
          İstatistikler
        </p>
        <div className="space-y-3">
          {form.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <Field
                id={`stat-val-${i}`}
                label={`İstatistik ${i + 1} — Değer`}
                value={stat.value}
                onChange={handleStat(i, "value")}
                placeholder="Örn: 50+"
              />
              <Field
                id={`stat-lbl-${i}`}
                label="Etiket"
                value={stat.label}
                onChange={handleStat(i, "label")}
                placeholder="Örn: Tamamlanan Proje"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <SaveBtn loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ─── Sekmeler ────────────────────────────────────────────────────────────── */
const TABS = [
  {
    id:    "contact",
    label: "İletişim Ayarları",
    icon:  "M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z",
  },
  {
    id:    "media",
    label: "Medya Ayarları",
    icon:  "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  },
  {
    id:    "corporate",
    label: "Kurumsal İçerik",
    icon:  "M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5m4 0H9",
  },
];

/* ─── Ana Bileşen ─────────────────────────────────────────────────────────── */
export default function SettingsAdminPage() {
  const [activeTab, setActiveTab] = useState("contact");
  const [toast,     setToast]     = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <>
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="p-6 lg:p-8 space-y-6">

        {/* ── Başlık ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#4988C5" }}>
            Yönetim
          </p>
          <h1 className="text-2xl font-gilroy font-bold" style={{ color: "#1B3F84" }}>
            Genel Ayarlar
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Site iletişim bilgileri, carousel görselleri ve kurumsal içeriği buradan yönetin.
          </p>
        </motion.div>

        {/* ── Sekmeler ────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
          style={{ background: "#DDE9F8" }}>
          {TABS.map((t) => (
            <Tab key={t.id} {...t} active={activeTab === t.id} onClick={setActiveTab} />
          ))}
        </div>

        {/* ── İçerik ──────────────────────────────────────────────────── */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[#DDE9F8] bg-white p-6 lg:p-8"
        >
          {activeTab === "contact"   && <ContactSettingsSection   onSave={showToast} />}
          {activeTab === "media"     && <MediaSettingsSection     onSave={showToast} />}
          {activeTab === "corporate" && <CorporateSettingsSection onSave={showToast} />}
        </motion.div>

      </div>
    </>
  );
}
