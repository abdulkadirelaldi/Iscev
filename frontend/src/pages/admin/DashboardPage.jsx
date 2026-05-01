import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import api from "../../api/axiosInstance";
import { getMessages, getUnreadCount } from "../../api/contact.api";

/* ─── Statik kart şablonu — değerler API'den doldurulur ─────────────────── */
const STAT_TEMPLATES = [
  { id: "products",     label: "Ürün",            apiKey: "products",     subKey: "active",    subLabel: "aktif",    href: "/admin/urunler",    iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { id: "services",     label: "Hizmet",           apiKey: "services",     subKey: "active",    subLabel: "aktif",    href: "/admin/hizmetler",  iconPath: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
  { id: "catalogs",     label: "Katalog",          apiKey: "catalogs",     subKey: "active",    subLabel: "aktif",    href: "/admin/kataloglar", iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" },
  { id: "blogs",        label: "Blog Yazısı",      apiKey: "blogs",        subKey: "published", subLabel: "yayında",  href: "/admin/blog",       iconPath: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { id: "mapLocations", label: "Harita Lokasyonu", apiKey: "mapLocations", subKey: null,        subLabel: null,       href: "/admin/harita",     iconPath: "M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0zM15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
  { id: "references",   label: "Referans",         apiKey: "references",   subKey: null,        subLabel: null,       href: "/admin/referanslar",iconPath: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" },
  { id: "categories",   label: "Kategori",         apiKey: "categories",   subKey: null,        subLabel: null,       href: "/admin/kategoriler",iconPath: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-5 5a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 12V7a4 4 0 0 1 4-4z" },
];

/* ─── Hızlı erişim menüsü ─────────────────────────────────────────────────── */
const QUICK_LINKS = [
  { label: "Ürün Ekle",        href: "/admin/urunler",    iconPath: "M12 4v16m8-8H4" },
  { label: "Katalog Yükle",    href: "/admin/kataloglar", iconPath: "M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
  { label: "Harita Pini Ekle", href: "/admin/harita",     iconPath: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" },
  { label: "Blog Yaz",         href: "/admin/blog",       iconPath: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { label: "Genel Ayarlar",    href: "/admin/ayarlar",    iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
];

/* ─── Yardımcı: API verisinden sayıyı güvenle çıkar ─────────────────────── */
const getTotal = (entry) => {
  if (entry == null) return 0;
  if (typeof entry === "number") return entry;
  return entry?.total ?? 0;
};

const getSub = (entry, subKey) => {
  if (!subKey || entry == null) return 0;
  if (typeof entry === "number") return 0;
  return entry?.[subKey] ?? 0;
};

/* ─── Stat Kart Skeleton ──────────────────────────────────────────────────── */
function StatCardSkeleton({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border border-[#DDE9F8] bg-white p-5 animate-pulse space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl" style={{ background: "#DDE9F8" }} />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-16 rounded-lg bg-gray-200" />
        <div className="h-3 w-20 rounded-full bg-gray-100" />
      </div>
      <div className="h-5 w-14 rounded-full bg-gray-100" />
    </motion.div>
  );
}

/* ─── Stat Kartı ──────────────────────────────────────────────────────────── */
function StatCard({ stat, entry, index }) {
  const total    = getTotal(entry);
  const subValue = getSub(entry, stat.subKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        to={stat.href}
        className="group flex flex-col gap-4 p-5 rounded-2xl border border-[#DDE9F8]
                   bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250"
      >
        {/* İkon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                     group-hover:scale-110 transition-transform duration-200"
          style={{ background: "#DDE9F8" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d={stat.iconPath} />
          </svg>
        </div>

        {/* Sayı + Etiket */}
        <div>
          <p className="text-3xl font-gilroy font-bold leading-none" style={{ color: "#1B3F84" }}>
            {total}
          </p>
          <p className="text-xs text-gray-400 mt-1.5 font-medium">{stat.label}</p>
        </div>

        {/* Alt satır: badge veya hover linki */}
        <div className="flex items-center justify-between min-h-[20px]">
          {stat.subKey ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: "#DDE9F8", color: "#1B3F84" }}
            >
              {subValue} {stat.subLabel}
            </span>
          ) : (
            <span />
          )}
          <span
            className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100
                       translate-x-1 group-hover:translate-x-0 transition-all duration-200"
            style={{ color: "#4988C5" }}
          >
            Yönet
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Hızlı Erişim Butonu ─────────────────────────────────────────────────── */
function QuickLink({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 + index * 0.06 }}
    >
      <Link
        to={item.href}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#DDE9F8]
                   bg-white hover:border-[#4988C5] hover:shadow-md hover:-translate-y-0.5
                   transition-all duration-200 group"
      >
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#DDE9F8" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#1B3F84" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d={item.iconPath} />
          </svg>
        </span>
        <span className="text-sm font-semibold font-gilroy" style={{ color: "#1B3F84" }}>
          {item.label}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>
    </motion.div>
  );
}

/* ─── Platform Özeti Paneli ───────────────────────────────────────────────── */
function PlatformSummary({ statsData, loading }) {
  const total = (key) => getTotal(statsData[key]);
  const sub   = (key, sk) => getSub(statsData[key], sk);

  const rows = loading
    ? Array.from({ length: 4 })
    : [
        {
          value: total("products") + total("services") + total("blogs") + total("references"),
          label: "içerik yayında",
        },
        {
          value: sub("products", "active") + sub("services", "active"),
          label: "aktif ürün & hizmet",
        },
        {
          value: total("mapLocations"),
          label: "global santral noktası",
        },
        {
          value: total("catalogs"),
          label: "indirilebilir katalog",
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.38 }}
      className="rounded-2xl border border-[#DDE9F8] bg-white p-6"
    >
      <h2 className="text-sm font-gilroy font-bold mb-5" style={{ color: "#1B3F84" }}>
        Platform Özeti
      </h2>

      <div className="space-y-0">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: i < rows.length - 1 ? "1px solid #F0F6FF" : "none" }}
          >
            {loading ? (
              <>
                <div className="h-7 w-10 rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-3 w-36 rounded-full bg-gray-100 animate-pulse" />
              </>
            ) : (
              <>
                <span
                  className="text-2xl font-gilroy font-bold leading-none"
                  style={{ color: "#1B3F84" }}
                >
                  {row.value}
                </span>
                <span className="text-xs text-gray-400 font-medium text-right">
                  {row.label}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Son Mesajlar Widget ─────────────────────────────────────────────────── */
function RecentMessages() {
  const [messages,  setMessages]  = useState([]);
  const [unread,    setUnread]    = useState(0);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getMessages({ limit: 5 }), getUnreadCount()])
      .then(([msgRes, cntRes]) => {
        const raw  = msgRes?.data ?? msgRes;
        const list = raw?.data?.messages ?? raw?.messages ?? raw?.data ?? raw;
        setMessages(Array.isArray(list) ? list.slice(0, 5) : []);

        const cntRaw = cntRes?.data ?? cntRes;
        setUnread(cntRaw?.data?.count ?? cntRaw?.count ?? 0);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  const statusMap = {
    new:     { label: "Yeni",       bg: "#FEE2E2", color: "#DC2626" },
    read:    { label: "Okundu",     bg: "#F1F5F9", color: "#64748B" },
    replied: { label: "Cevaplandı", bg: "#DCFCE7", color: "#16A34A" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.42 }}
      className="rounded-2xl border border-[#DDE9F8] bg-white p-6"
    >
      {/* Başlık */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-gilroy font-bold flex items-center gap-2" style={{ color: "#1B3F84" }}>
          Son Mesajlar
          {unread > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
              {unread}
            </span>
          )}
        </h2>
        <Link
          to="/admin/mesajlar"
          className="text-[11px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: "#4988C5" }}
        >
          Tümünü Gör
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "#DDE9F8" }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 rounded-full bg-gray-200 w-1/3" />
                <div className="h-2 rounded-full bg-gray-100 w-2/3" />
              </div>
              <div className="h-4 w-14 rounded-full bg-gray-100 shrink-0" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#DDE9F8" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-400">Henüz mesaj yok</p>
        </div>
      ) : (
        <div className="space-y-0">
          {messages.map((msg, i) => {
            const s = statusMap[msg.status] ?? statusMap.read;
            const initials = (msg.name ?? "?").charAt(0).toUpperCase();
            const isNew = msg.status === "new";
            return (
              <Link
                key={msg._id}
                to="/admin/mesajlar"
                className="flex items-center gap-3 py-3 group transition-opacity hover:opacity-75"
                style={{ borderBottom: i < messages.length - 1 ? "1px solid #F0F6FF" : "none" }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: isNew ? "#1B3F84" : "#4988C5" }}
                >
                  {initials}
                </div>

                {/* İsim + önizleme */}
                <div className="flex-1 min-w-0">
                  <p className={["text-xs truncate", isNew ? "font-bold" : "font-medium text-gray-700"].join(" ")}
                    style={isNew ? { color: "#1B3F84" } : {}}>
                    {msg.name}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{msg.subject}</p>
                </div>

                {/* Badge */}
                <span
                  className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const admin = useAuthStore((s) => s.admin);
  const [statsData,    setStatsData]    = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get("/stats")
      .then((r) => {
        const raw = r?.data?.data ?? r?.data ?? r;
        setStatsData(raw && typeof raw === "object" ? raw : {});
      })
      .catch(() => setStatsData({}))
      .finally(() => setStatsLoading(false));
  }, []);

  const now      = new Date();
  const hour     = now.getHours();
  const greeting =
    hour < 6  ? "İyi geceler" :
    hour < 12 ? "Günaydın"   :
    hour < 18 ? "İyi günler" : "İyi akşamlar";

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* ── Başlık ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#4988C5" }}>
            Yönetim Paneli
          </p>
          <h1 className="text-2xl font-gilroy font-bold" style={{ color: "#1B3F84" }}>
            {greeting}, {admin?.name ?? "Admin"} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {now.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Site önizleme butonu */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl
                     text-sm font-semibold border transition-all duration-150
                     hover:shadow-md hover:-translate-y-0.5"
          style={{ borderColor: "#1B3F84", color: "#1B3F84" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Siteyi Önizle
        </a>
      </motion.div>

      {/* ── İstatistik Kartları ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "#4988C5" }}>
          Genel Bakış
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {statsLoading
            ? STAT_TEMPLATES.map((s, i) => <StatCardSkeleton key={s.id} index={i} />)
            : STAT_TEMPLATES.map((s, i) => (
                <StatCard
                  key={s.id}
                  stat={s}
                  entry={statsData[s.apiKey]}
                  index={i}
                />
              ))
          }
        </div>
      </div>

      {/* ── Alt üç kolon ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Hızlı Erişim */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-[#DDE9F8] bg-white p-6"
        >
          <h2 className="text-sm font-gilroy font-bold mb-4" style={{ color: "#1B3F84" }}>
            Hızlı Erişim
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {QUICK_LINKS.map((item, i) => (
              <QuickLink key={item.label} item={item} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Son Mesajlar */}
        <RecentMessages />

        {/* Platform Özeti */}
        <PlatformSummary statsData={statsData} loading={statsLoading} />

      </div>
    </div>
  );
}
