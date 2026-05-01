import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axiosInstance";
import useAuthStore from "../../store/authStore";

/* ─── Sekme ───────────────────────────────────────────────────────────────── */
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
function Field({ label, id, type = "text", value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold" style={{ color: "#1B3F84" }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-4 py-3 text-sm text-gray-700 bg-white border border-[#DDE9F8] rounded-xl
                   outline-none placeholder:text-gray-300 transition-all duration-150
                   focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]"
      />
    </div>
  );
}

/* ─── Kaydet butonu ───────────────────────────────────────────────────────── */
function SaveBtn({ loading, onClick, label = "Değişiklikleri Kaydet" }) {
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
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
          {label}
        </>
      )}
    </button>
  );
}

/* ─── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5
                     rounded-2xl shadow-xl text-white text-sm font-semibold"
          style={{ background: "#1B3F84" }}
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

/* ═══════════════════════════════════════════════════════════════════════════ */

/* ── Sekme 1: Profil Bilgileri ────────────────────────────────────────────── */
function ProfileSection({ onToast }) {
  const admin     = useAuthStore((s) => s.admin);
  const [form,    setForm]    = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  /* Mount'ta formu doldur */
  useEffect(() => {
    api.get("/auth/me")
      .then((r) => {
        const raw  = r?.data ?? r;
        const data = raw?.data?.admin ?? raw?.admin ?? raw?.data ?? raw;
        setForm({
          name:  data?.name  ?? admin?.name  ?? "",
          email: data?.email ?? admin?.email ?? "",
        });
      })
      .catch(() => {
        setForm({
          name:  admin?.name  ?? "",
          email: admin?.email ?? "",
        });
      });
  }, [admin]);

  const handle = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/auth/profile", { name: form.name, email: form.email });

      /* Zustand store'daki admin objesini güncelle */
      const currentAdmin = useAuthStore.getState().admin;
      useAuthStore.setState({
        admin: { ...currentAdmin, name: form.name, email: form.email },
      });

      onToast("Profil güncellendi.");
    } catch (err) {
      onToast(err?.response?.data?.message ?? "Kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
        title="Profil Bilgileri"
        subtitle="Ad, soyad ve e-posta adresinizi güncelleyin."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          id="name"
          label="Ad Soyad"
          value={form.name}
          onChange={handle("name")}
          placeholder="Adınız Soyadınız"
        />
        <Field
          id="email"
          type="email"
          label="E-posta"
          value={form.email}
          onChange={handle("email")}
          placeholder="admin@iscev.com.tr"
        />
      </div>

      <div className="flex justify-end pt-2">
        <SaveBtn loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ── Sekme 2: Şifre Değiştir ──────────────────────────────────────────────── */
function PasswordSection({ onToast }) {
  const navigate = useNavigate();
  const logout   = useAuthStore((s) => s.logout);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (key) => (e) => {
    setError("");
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setError("Yeni şifre ve tekrarı eşleşmiyor.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });

      onToast("Şifre değiştirildi. Yeniden giriş yapınız.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => {
        logout();
        navigate("/admin/giris", { replace: true });
      }, 2000);
    } catch (err) {
      const code = err?.response?.data?.code ?? err?.response?.data?.error;
      if (code === "WRONG_PASSWORD" || err?.response?.status === 401) {
        setError("Mevcut şifre hatalı.");
      } else {
        setError(err?.response?.data?.message ?? "Şifre değiştirilemedi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"
        title="Şifre Değiştir"
        subtitle="Güvenliğiniz için şifrenizi düzenli aralıklarla güncelleyin."
      />

      <div className="space-y-4 max-w-md">
        <Field
          id="currentPassword"
          type="password"
          label="Mevcut Şifre"
          value={form.currentPassword}
          onChange={handle("currentPassword")}
          placeholder="••••••••"
        />
        <Field
          id="newPassword"
          type="password"
          label="Yeni Şifre"
          value={form.newPassword}
          onChange={handle("newPassword")}
          placeholder="••••••••"
        />
        <Field
          id="confirmPassword"
          type="password"
          label="Yeni Şifre Tekrar"
          value={form.confirmPassword}
          onChange={handle("confirmPassword")}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      )}

      <div className="flex justify-end pt-2">
        <SaveBtn
          loading={loading}
          onClick={handleSave}
          label="Şifreyi Değiştir"
        />
      </div>
    </div>
  );
}

/* ─── Sekmeler ────────────────────────────────────────────────────────────── */
const TABS = [
  {
    id:    "profile",
    label: "Profil Bilgileri",
    icon:  "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z",
  },
  {
    id:    "password",
    label: "Şifre Değiştir",
    icon:  "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z",
  },
];

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function ProfileAdminPage() {
  const [activeTab, setActiveTab] = useState("profile");
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
            Hesap
          </p>
          <h1 className="text-2xl font-gilroy font-bold" style={{ color: "#1B3F84" }}>
            Profil & Güvenlik
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Hesap bilgilerinizi ve şifrenizi buradan yönetin.
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
          {activeTab === "profile"  && <ProfileSection  onToast={showToast} />}
          {activeTab === "password" && <PasswordSection onToast={showToast} />}
        </motion.div>

      </div>
    </>
  );
}
