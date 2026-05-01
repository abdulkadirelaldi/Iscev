import { useState } from "react";
import { submitContact } from "../../api/contact.api";
import { motion } from "framer-motion";
import PageSEO from "../../components/common/PageSEO";
import { useSettings } from "../../context/SettingsContext";

/* ─── İkon bileşeni ───────────────────────────────────────────────────────── */
function Icon({ path, size = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={size}>
      <path d={path} />
    </svg>
  );
}

/* ─── Bilgi satırı ────────────────────────────────────────────────────────── */
function InfoRow({ iconPath, label, value, href }) {
  const Content = () => (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: "#4988C5" }}>
        <Icon path={iconPath} />
      </span>
      <div>
        <p className="text-[10px] font-semibold tracking-wider uppercase mb-0.5"
          style={{ color: "#4988C5" }}>
          {label}
        </p>
        <p className="text-sm text-white/90 leading-snug">{value}</p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="hover:opacity-80 transition-opacity">
      <Content />
    </a>
  ) : (
    <div><Content /></div>
  );
}

/* ─── Form input alanı ────────────────────────────────────────────────────── */
function Field({ label, id, type = "text", as, rows, value, onChange, required, placeholder }) {
  const base = `w-full rounded-xl border px-4 py-3 text-sm bg-white
                outline-none transition-all duration-150
                placeholder:text-gray-300 text-gray-700
                focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold" style={{ color: "#1B3F84" }}>
        {label}{required && <span className="ml-0.5" style={{ color: "#4988C5" }}>*</span>}
      </label>
      {as === "textarea" ? (
        <textarea id={id} rows={rows ?? 5} value={value} onChange={onChange}
          required={required} placeholder={placeholder}
          className={`${base} resize-none`}
          style={{ borderColor: "#DDE9F8" }} />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange}
          required={required} placeholder={placeholder}
          className={base}
          style={{ borderColor: "#DDE9F8" }} />
      )}
    </div>
  );
}

/* ─── Gönderim durumu ─────────────────────────────────────────────────────── */
const STATUS = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(STATUS.IDLE);

  const { contactInfo } = useSettings() ?? {};
  const address     = contactInfo?.address      || "Organize Sanayi Bölgesi, 1. Cadde No:42, 41400 Gebze / Kocaeli, Türkiye";
  const phone       = contactInfo?.phone        || "+90 (262) 123 45 67";
  const email       = contactInfo?.email        || "info@iscev.com.tr";
  const mapEmbedUrl = contactInfo?.mapEmbedUrl  || null;
  const linkedin    = contactInfo?.linkedinUrl  || "https://linkedin.com";
  const instagram   = contactInfo?.instagramUrl || "https://instagram.com";

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(STATUS.LOADING);
    try {
      await submitContact(form);
      setStatus(STATUS.SUCCESS);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus(STATUS.ERROR);
    }
  };

  return (
    <>
      <PageSEO
        title="İletişim — Bize Ulaşın"
        description="İSÇEV Arıtma ve Çevre Teknolojileri ile iletişime geçin. Proje talepleriniz, teknik sorularınız ve işbirliği için formunuzu doldurun."
        canonical="/iletisim"
      />
      {/* ── Hero-mini ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B3F84 0%, #2d5ba8 100%)" }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: "#DDE9F8" }} />
        <div className="container-iscev relative z-10 py-14 sm:py-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#DDE9F8" }}>
            Bize Ulaşın
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-gilroy font-bold text-white mb-4 leading-tight">
            İletişim
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="text-sm max-w-lg leading-relaxed"
            style={{ color: "rgba(221,233,248,0.8)" }}>
            Proje talepleriniz, teknik sorularınız veya işbirliği fırsatları için
            ekibimizle iletişime geçin.
          </motion.p>
        </div>
      </section>

      {/* ── İki Kolon — Form + Harita ───────────────────────────────────── */}
      <section className="py-0" style={{ background: "#F8FBFF" }}>
        <div className="container-iscev">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-none lg:rounded-2xl
                          overflow-hidden shadow-xl my-14">

            {/* ── SOL: Form + Bilgiler ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="flex flex-col"
            >
              {/* Üst — İletişim Bilgileri */}
              <div className="p-8 sm:p-10 space-y-5"
                style={{ background: "linear-gradient(135deg, #1B3F84 0%, #1a3a7a 100%)" }}>
                <h2 className="text-lg font-gilroy font-bold text-white mb-1">
                  İletişim Bilgileri
                </h2>
                <p className="text-xs leading-relaxed mb-4"
                  style={{ color: "rgba(221,233,248,0.75)" }}>
                  Dünya genelinde kurduğumuz 200+ santral ve onlarca ülkedeki
                  deneyimimizle, projenize en uygun çözümü birlikte tasarlayalım.
                </p>

                <div className="space-y-4">
                  <InfoRow
                    iconPath="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                    label="Merkez Ofis"
                    value={address}
                  />
                  <InfoRow
                    iconPath="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    label="Telefon"
                    value={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                  />
                  <InfoRow
                    iconPath="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
                    label="E-posta"
                    value={email}
                    href={`mailto:${email}`}
                  />
                  <InfoRow
                    iconPath="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0 0v-4m0-6v-4m-4 6h8"
                    label="Çalışma Saatleri"
                    value="Pazartesi – Cuma: 08:30 – 17:30"
                  />
                </div>

                {/* Sosyal medya */}
                <div className="flex gap-3 pt-2">
                  {[
                    {
                      label: "LinkedIn",
                      href: linkedin,
                      path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
                    },
                    {
                      label: "Instagram",
                      href: instagram,
                      path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z",
                    },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-colors duration-150"
                      style={{ background: "rgba(255,255,255,0.12)", color: "#DDE9F8" }}
                      title={s.label}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        className="w-4 h-4">
                        <path d={s.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Alt — Form */}
              <div className="p-8 sm:p-10 bg-white flex-1">
                <h2 className="text-lg font-gilroy font-bold mb-6" style={{ color: "#1B3F84" }}>
                  Mesaj Gönderin
                </h2>

                {status === STATUS.SUCCESS ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: "#DDE9F8" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-gilroy font-bold text-base" style={{ color: "#1B3F84" }}>
                        Mesajınız İletildi
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        En kısa sürede size dönüş yapacağız.
                      </p>
                    </div>
                    <button onClick={() => setStatus(STATUS.IDLE)}
                      className="text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
                      style={{ color: "#4988C5" }}>
                      Yeni mesaj gönder
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field id="name" label="Ad Soyad" required value={form.name}
                        onChange={handleChange} placeholder="Ahmet Yılmaz" />
                      <Field id="email" type="email" label="E-posta Adresi" required
                        value={form.email} onChange={handleChange}
                        placeholder="ahmet@sirket.com" />
                    </div>
                    <Field id="subject" label="Konu" required value={form.subject}
                      onChange={handleChange} placeholder="Proje talebi, teknik soru…" />
                    <Field id="message" as="textarea" label="Mesajınız" required
                      value={form.message} onChange={handleChange} rows={5}
                      placeholder="Projeniz veya talebiniz hakkında detaylı bilgi verin…" />

                    {status === STATUS.ERROR && (
                      <p className="text-xs text-red-500">
                        Bir hata oluştu, lütfen tekrar deneyin.
                      </p>
                    )}

                    <button type="submit" disabled={status === STATUS.LOADING}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                                 text-sm font-bold text-white transition-all duration-200
                                 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                      style={{ background: "linear-gradient(90deg, #1B3F84, #4988C5)" }}>
                      {status === STATUS.LOADING ? (
                        <>
                          <svg className="animate-spin w-4 h-4 text-white"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10"
                              stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Gönderiliyor…
                        </>
                      ) : (
                        <>
                          Mesajı Gönder
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className="w-4 h-4">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* ── SAĞ: Google Maps ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
              className="relative min-h-[420px] lg:min-h-full overflow-hidden"
            >
              {mapEmbedUrl ? (
                <iframe
                  title="İSÇEV Merkez Ofis Konumu"
                  src={mapEmbedUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: "#F4F9FF" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 opacity-40">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>
                    <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  </svg>
                  <p className="text-xs text-gray-400 font-medium">Harita yüklenemedi</p>
                </div>
              )}

              {/* Overlay gradient sol kenar — sol panelle yumuşak birleşim */}
              <div className="absolute inset-y-0 left-0 w-4 pointer-events-none hidden lg:block"
                style={{ background: "linear-gradient(to right, rgba(248,251,255,0.6), transparent)" }} />
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}
