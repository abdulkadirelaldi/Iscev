import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCorporate,
  updateHeroStats,
  updateValues,
  updateMilestones,
  updateGlobalStats,
  updateRegions,
  updateCerts,
} from "../../api/corporate.api";
import { getTeamAdmin, createMember, updateMember, deleteMember } from "../../api/team.api";

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000";

/* ─── Ortak UI Bileşenleri ────────────────────────────────────────────────── */
function Tab({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap"
      style={active ? { background: "#1B3F84", color: "#fff" } : { background: "transparent", color: "#4988C5" }}
    >
      {label}
    </button>
  );
}

function Inp({ value, onChange, placeholder, className = "" }) {
  return (
    <input
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-3 py-2 text-sm text-gray-700 bg-white border border-[#DDE9F8] rounded-xl outline-none
                  placeholder:text-gray-300 focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]
                  transition-all duration-150 ${className}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-[#DDE9F8] rounded-xl outline-none
                 placeholder:text-gray-300 resize-none focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]
                 transition-all duration-150"
    />
  );
}

function SaveBtn({ loading, onClick, label = "Kaydet" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white
                 transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: "linear-gradient(90deg, #1B3F84, #4988C5)" }}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Kaydediliyor…
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6M9 6V4h6v2" />
      </svg>
    </button>
  );
}

function AddBtn({ onClick, label = "+ Satır Ekle" }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                 border border-dashed border-[#4988C5] transition-colors hover:bg-[#F0F7FF]"
      style={{ color: "#4988C5" }}
    >
      {label}
    </button>
  );
}

function Toast({ msg, onClose }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
                     rounded-2xl shadow-xl text-white text-sm font-semibold"
          style={{ background: "#1B3F84" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#DDE9F8]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {msg}
          <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
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

function SectionHeader({ title, subtitle }) {
  return (
    <div className="pb-4 border-b border-[#F0F6FF]">
      <h3 className="text-sm font-gilroy font-bold" style={{ color: "#1B3F84" }}>{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ── Sekme 1: Hero İstatistikler ─────────────────────────────────────────── */
function HeroStatsSection({ data, onToast }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(data)) setItems(data);
  }, [data]);

  const change = (i, field) => (e) =>
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateHeroStats(items);
      onToast("Hero istatistikler kaydedildi.");
    } catch {
      onToast("Kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Hero İstatistikler"
        subtitle="Ana sayfanın hero bölümündeki hızlı istatistik değerleri."
      />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Inp value={item.val} onChange={change(i, "val")} placeholder="50+" className="w-20" />
            <Inp value={item.label} onChange={change(i, "label")} placeholder="Etiket" className="flex-1" />
            <DeleteBtn onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <AddBtn onClick={() => setItems((p) => [...p, { val: "", label: "" }])} />
        <SaveBtn loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ── Sekme 2: Temel Değerler ──────────────────────────────────────────────── */
function ValuesSection({ data, onToast }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(data)) setItems(data);
  }, [data]);

  const change = (i, field) => (e) =>
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateValues(items);
      onToast("Temel değerler kaydedildi.");
    } catch {
      onToast("Kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Temel Değerler" subtitle="Kurumsal Hakkımızda sayfasındaki değer kartları." />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-xl border border-[#DDE9F8] bg-[#F8FBFF]">
            <Inp value={item.icon} onChange={change(i, "icon")} placeholder="💡" className="w-12 text-center" />
            <Inp value={item.title} onChange={change(i, "title")} placeholder="Başlık" className="w-36" />
            <Textarea value={item.desc} onChange={change(i, "desc")} placeholder="Açıklama…" />
            <DeleteBtn onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <AddBtn onClick={() => setItems((p) => [...p, { icon: "", title: "", desc: "" }])} />
        <SaveBtn loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ── Sekme 3: Kilometre Taşları ───────────────────────────────────────────── */
function MilestonesSection({ data, onToast }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(data)) setItems(data);
  }, [data]);

  const change = (i, field) => (e) =>
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMilestones(items);
      onToast("Kilometre taşları kaydedildi.");
    } catch {
      onToast("Kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Kilometre Taşları" subtitle="Şirket tarihindeki önemli dönüm noktaları." />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-xl border border-[#DDE9F8] bg-[#F8FBFF]">
            <Inp value={item.icon} onChange={change(i, "icon")} placeholder="🏛️" className="w-12 text-center" />
            <Inp value={item.year} onChange={change(i, "year")} placeholder="1998" className="w-20" />
            <Inp value={item.title} onChange={change(i, "title")} placeholder="Başlık" className="w-36" />
            <Textarea value={item.desc} onChange={change(i, "desc")} placeholder="Açıklama…" />
            <DeleteBtn onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <AddBtn onClick={() => setItems((p) => [...p, { icon: "", year: "", title: "", desc: "" }])} />
        <SaveBtn loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ── Sekme 4: Liderlik Kadrosu ────────────────────────────────────────────── */
function TeamMemberCard({ member, onSaved, onDeleted, onToast }) {
  const [form,    setForm]    = useState({
    name: member.name ?? "", title: member.title ?? "",
    bio:  member.bio  ?? "", linkedin: member.linkedin ?? "",
  });
  const [photo,   setPhoto]   = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);
  const fileRef = useRef(null);

  const photoSrc = photo
    ? URL.createObjectURL(photo)
    : member.photoPath
    ? `${UPLOADS_BASE}/${member.photoPath}`
    : null;

  const initials = (form.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handle = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",     form.name);
      fd.append("title",    form.title);
      fd.append("bio",      form.bio);
      fd.append("linkedin", form.linkedin);
      if (photo) fd.append("photo", photo);
      await updateMember(member._id, fd);
      onSaved();
      onToast("Üye güncellendi.");
      setPhoto(null);
    } catch {
      onToast("Güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${member.name}" silinsin mi?`)) return;
    setDeleting(true);
    try {
      await deleteMember(member._id);
      onDeleted(member._id);
      onToast("Üye silindi.");
    } catch {
      onToast("Silinemedi.");
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#DDE9F8] bg-white p-5 space-y-4">
      <div className="flex gap-4">
        {/* Avatar / Fotoğraf */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden cursor-pointer
                       border-2 border-[#DDE9F8] hover:border-[#4988C5] transition-colors"
            onClick={() => fileRef.current?.click()}
            title="Fotoğraf değiştir"
          >
            {photoSrc ? (
              <img src={photoSrc} alt={form.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold font-gilroy"
                style={{ background: "#1B3F84" }}>
                {initials}
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhoto(e.target.files[0] ?? null)}
          />
          <span className="text-[10px] text-gray-400 text-center cursor-pointer hover:text-[#4988C5]"
            onClick={() => fileRef.current?.click()}>
            Fotoğraf
          </span>
        </div>

        {/* Alanlar */}
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Inp value={form.name}     onChange={handle("name")}     placeholder="Ad Soyad" />
            <Inp value={form.title}    onChange={handle("title")}    placeholder="Ünvan" />
          </div>
          <Inp value={form.linkedin} onChange={handle("linkedin")} placeholder="LinkedIn URL" className="w-full" />
          <Textarea value={form.bio} onChange={handle("bio")} placeholder="Kısa biyografi…" rows={3} />
        </div>
      </div>

      <div className="flex justify-between pt-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-semibold text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {deleting ? "Siliniyor…" : "Üyeyi Sil"}
        </button>
        <SaveBtn loading={saving} onClick={handleSave} label="Güncelle" />
      </div>
    </div>
  );
}

function NewMemberForm({ onCreated, onToast }) {
  const [form,   setForm]   = useState({ name: "", title: "", bio: "", linkedin: "" });
  const [photo,  setPhoto]  = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handle = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",     form.name);
      fd.append("title",    form.title);
      fd.append("bio",      form.bio);
      fd.append("linkedin", form.linkedin);
      if (photo) fd.append("photo", photo);
      const res  = await createMember(fd);
      const raw  = res?.data ?? res;
      const member = raw?.data?.member ?? raw?.member ?? raw?.data ?? raw;
      onCreated(member);
      onToast("Yeni üye eklendi.");
      setForm({ name: "", title: "", bio: "", linkedin: "" });
      setPhoto(null);
    } catch {
      onToast("Eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-[#4988C5] bg-[#F8FBFF] p-5 space-y-3">
      <p className="text-xs font-bold" style={{ color: "#1B3F84" }}>Yeni Üye Ekle</p>
      <div className="grid grid-cols-2 gap-2">
        <Inp value={form.name}     onChange={handle("name")}     placeholder="Ad Soyad *" />
        <Inp value={form.title}    onChange={handle("title")}    placeholder="Ünvan" />
      </div>
      <Inp value={form.linkedin} onChange={handle("linkedin")} placeholder="LinkedIn URL" className="w-full" />
      <Textarea value={form.bio} onChange={handle("bio")} placeholder="Kısa biyografi…" rows={3} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DDE9F8]
                       bg-white hover:bg-[#F0F7FF] transition-colors"
            style={{ color: "#4988C5" }}
          >
            {photo ? photo.name.slice(0, 20) + "…" : "Fotoğraf Seç"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => setPhoto(e.target.files[0] ?? null)} />
        </div>
        <SaveBtn loading={saving} onClick={handleCreate} label="Ekle" />
      </div>
    </div>
  );
}

function TeamSection({ onToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamAdmin()
      .then((r) => {
        const raw  = r?.data ?? r;
        const list = raw?.data?.members ?? raw?.members ?? raw?.data ?? raw;
        setMembers(Array.isArray(list) ? list : []);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader title="Liderlik Kadrosu" subtitle="Hakkımızda sayfasında görünen ekip üyeleri." />
      {loading ? (
        <div className="text-sm text-gray-400 py-6 text-center">Yükleniyor…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {members.map((m) => (
            <TeamMemberCard
              key={m._id}
              member={m}
              onSaved={() => {}}
              onDeleted={(id) => setMembers((p) => p.filter((x) => x._id !== id))}
              onToast={onToast}
            />
          ))}
        </div>
      )}
      <NewMemberForm
        onCreated={(m) => { if (m?._id) setMembers((p) => [...p, m]); }}
        onToast={onToast}
      />
    </div>
  );
}

/* ── Sekme 5: Küresel Güç ─────────────────────────────────────────────────── */
function GlobalSection({ globalStatsData, regionsData, onToast }) {
  const [stats,   setStats]   = useState([]);
  const [regions, setRegions] = useState([]);
  const [loadingS, setLoadingS] = useState(false);
  const [loadingR, setLoadingR] = useState(false);

  useEffect(() => {
    if (Array.isArray(globalStatsData)) setStats(globalStatsData);
  }, [globalStatsData]);

  useEffect(() => {
    if (Array.isArray(regionsData))
      setRegions(regionsData.map((r) => ({
        ...r,
        countriesStr: Array.isArray(r.countries)
          ? r.countries.join(", ")
          : (r.countries ?? ""),
      })));
  }, [regionsData]);

  const changeS = (i, field) => (e) =>
    setStats((p) => p.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item));

  const changeR = (i, field) => (e) =>
    setRegions((p) => p.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item));

  const handleSaveStats = async () => {
    setLoadingS(true);
    try {
      await updateGlobalStats(stats);
      onToast("Küresel istatistikler kaydedildi.");
    } catch { onToast("Kaydedilemedi."); }
    finally { setLoadingS(false); }
  };

  const handleSaveRegions = async () => {
    setLoadingR(true);
    try {
      const payload = regions.map(({ countriesStr, ...rest }) => ({
        ...rest,
        countries: (countriesStr ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      }));
      await updateRegions(payload);
      onToast("Bölgeler kaydedildi.");
    } catch { onToast("Kaydedilemedi."); }
    finally { setLoadingR(false); }
  };

  return (
    <div className="space-y-8">
      {/* Global Stats */}
      <div className="space-y-4">
        <SectionHeader title="Küresel İstatistikler" subtitle="Hakkımızda sayfasındaki sayısal göstergeler." />
        <div className="space-y-2">
          {stats.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Inp value={item.val} onChange={changeS(i, "val")} placeholder="18+" className="w-20" />
              <Inp value={item.label} onChange={changeS(i, "label")} placeholder="Aktif Ülke" className="flex-1" />
              <DeleteBtn onClick={() => setStats((p) => p.filter((_, idx) => idx !== i))} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <AddBtn onClick={() => setStats((p) => [...p, { val: "", label: "" }])} />
          <SaveBtn loading={loadingS} onClick={handleSaveStats} />
        </div>
      </div>

      <div className="border-t border-[#F0F6FF]" />

      {/* Regions */}
      <div className="space-y-4">
        <SectionHeader title="Coğrafi Bölgeler" subtitle="Her bölge için bayrak, proje sayısı ve ülke kodları (virgülle ayrılmış)." />
        <div className="space-y-3">
          {regions.map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-[#DDE9F8] bg-[#F8FBFF] flex-wrap">
              <Inp value={item.flag}        onChange={changeR(i, "flag")}        placeholder="🇹🇷" className="w-12 text-center" />
              <Inp value={item.region}      onChange={changeR(i, "region")}      placeholder="Bölge adı" className="w-40" />
              <Inp value={item.projects}    onChange={changeR(i, "projects")}    placeholder="180" className="w-16" />
              <Inp value={item.countriesStr} onChange={changeR(i, "countriesStr")} placeholder="TR, SA, AE" className="flex-1 min-w-32" />
              <DeleteBtn onClick={() => setRegions((p) => p.filter((_, idx) => idx !== i))} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <AddBtn onClick={() => setRegions((p) => [...p, { flag: "", region: "", projects: "", countriesStr: "" }])} />
          <SaveBtn loading={loadingR} onClick={handleSaveRegions} />
        </div>
      </div>
    </div>
  );
}

/* ── Sekme 6: Sertifikalar ────────────────────────────────────────────────── */
function CertsSection({ data, onToast }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(data)) setItems(data);
  }, [data]);

  const change = (i, field) => (e) =>
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateCerts(items);
      onToast("Sertifikalar kaydedildi.");
    } catch { onToast("Kaydedilemedi."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Sertifikalar" subtitle="Kalite belgeleri ve sertifikasyon bilgileri." />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-xl border border-[#DDE9F8] bg-[#F8FBFF] flex-wrap">
            <Inp value={item.code}  onChange={change(i, "code")}  placeholder="ISO 9001" className="w-28" />
            <Inp value={item.label} onChange={change(i, "label")} placeholder="Etiket"   className="w-44" />
            <Textarea value={item.desc} onChange={change(i, "desc")} placeholder="Açıklama…" />
            <div className="flex items-center gap-1 shrink-0">
              <label className="text-[10px] text-gray-400">Renk</label>
              <input
                type="color"
                value={item.color || "#1B3F84"}
                onChange={change(i, "color")}
                className="w-9 h-9 rounded-lg cursor-pointer border border-[#DDE9F8] p-0.5 bg-white"
              />
            </div>
            <DeleteBtn onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <AddBtn onClick={() => setItems((p) => [...p, { code: "", label: "", desc: "", color: "#1B3F84" }])} />
        <SaveBtn loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ─── Sekmeler ────────────────────────────────────────────────────────────── */
const TABS = [
  { id: "heroStats",   label: "Hero İstatistikler" },
  { id: "values",      label: "Temel Değerler"     },
  { id: "milestones",  label: "Kilometre Taşları"  },
  { id: "team",        label: "Liderlik Kadrosu"   },
  { id: "global",      label: "Küresel Güç"        },
  { id: "certs",       label: "Sertifikalar"       },
];

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function CorporateAdminPage() {
  const [activeTab, setActiveTab] = useState("heroStats");
  const [content,   setContent]   = useState(null);
  const [toast,     setToast]     = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getCorporate()
      .then((r) => {
        const raw  = r?.data ?? r;
        const data = raw?.data ?? raw;
        setContent(data);
      })
      .catch(() => setContent({}));
  }, []);

  return (
    <>
      <Toast msg={toast} onClose={() => setToast(null)} />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#4988C5" }}>
            İçerik Yönetimi
          </p>
          <h1 className="text-2xl font-gilroy font-bold" style={{ color: "#1B3F84" }}>
            Kurumsal Sayfa
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Hakkımızda sayfasının tüm bölümlerini buradan yönetin.
          </p>
        </motion.div>

        {/* Sekmeler */}
        <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto" style={{ background: "#DDE9F8" }}>
          {TABS.map((t) => (
            <Tab key={t.id} id={t.id} label={t.label} active={activeTab === t.id} onClick={setActiveTab} />
          ))}
        </div>

        {/* İçerik */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[#DDE9F8] bg-white p-6 lg:p-8"
        >
          {activeTab === "heroStats"  && <HeroStatsSection  data={content?.heroStats}   onToast={showToast} />}
          {activeTab === "values"     && <ValuesSection     data={content?.values}      onToast={showToast} />}
          {activeTab === "milestones" && <MilestonesSection data={content?.milestones}  onToast={showToast} />}
          {activeTab === "team"       && <TeamSection                                   onToast={showToast} />}
          {activeTab === "global"     && (
            <GlobalSection
              globalStatsData={content?.globalStats}
              regionsData={content?.regions}
              onToast={showToast}
            />
          )}
          {activeTab === "certs"      && <CertsSection data={content?.certs} onToast={showToast} />}
        </motion.div>
      </div>
    </>
  );
}
