import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMessages,
  getUnreadCount,
  markAsRead,
  replyMessage,
  deleteMessage,
} from "../../api/contact.api";

/* ─── Yardımcılar ─────────────────────────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const preview = (text, len = 80) =>
  text?.length > len ? text.slice(0, len) + "…" : (text ?? "");

/* ─── Durum badge'i ───────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    new:      { label: "Yeni",        bg: "#FEE2E2", color: "#DC2626" },
    read:     { label: "Okundu",      bg: "#F1F5F9", color: "#64748B" },
    replied:  { label: "Cevaplandı",  bg: "#DCFCE7", color: "#16A34A" },
  };
  const s = map[status] ?? map.read;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {status === "new" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      )}
      {s.label}
    </span>
  );
}

/* ─── Toast ───────────────────────────────────────────────────────────────── */
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

/* ─── Skeleton satır ──────────────────────────────────────────────────────── */
function RowSkeleton({ i }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.06 }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-[#DDE9F8] bg-white animate-pulse"
    >
      <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "#DDE9F8" }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded-full bg-gray-200" />
        <div className="h-3 w-48 rounded-full bg-gray-100" />
      </div>
      <div className="hidden sm:block flex-1 space-y-2">
        <div className="h-3 w-40 rounded-full bg-gray-200" />
        <div className="h-3 w-56 rounded-full bg-gray-100" />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="h-3 w-20 rounded-full bg-gray-100" />
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </div>
    </motion.div>
  );
}

/* ─── Mesaj satır kartı ───────────────────────────────────────────────────── */
function MessageRow({ msg, onSelect, onDelete }) {
  const initials = (msg.name ?? "?").charAt(0).toUpperCase();
  const isNew    = msg.status === "new";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer group",
        "hover:shadow-md hover:-translate-y-0.5",
        isNew
          ? "border-[#4988C5]/40 bg-[#F0F7FF]"
          : "border-[#DDE9F8] bg-white",
      ].join(" ")}
      onClick={() => onSelect(msg)}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm
                   font-bold shrink-0"
        style={{ background: isNew ? "#1B3F84" : "#4988C5" }}
      >
        {initials}
      </div>

      {/* İsim + email */}
      <div className="w-36 shrink-0 hidden sm:block">
        <p className="text-sm font-semibold truncate" style={{ color: "#1B3F84" }}>
          {msg.name}
        </p>
        <p className="text-[11px] text-gray-400 truncate">{msg.email}</p>
      </div>

      {/* Konu + önizleme */}
      <div className="flex-1 min-w-0">
        <p className={["text-sm truncate", isNew ? "font-bold" : "font-medium text-gray-700"].join(" ")}
          style={isNew ? { color: "#1B3F84" } : {}}>
          {msg.subject}
        </p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">
          {preview(msg.message)}
        </p>
      </div>

      {/* Tarih + badge + sil */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
        <span className="text-[10px] text-gray-400">{formatDate(msg.createdAt)}</span>
        <StatusBadge status={msg.status} />
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(msg._id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg
                     hover:bg-red-50 text-red-400"
          title="Sil"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Detay görünümü ──────────────────────────────────────────────────────── */
function MessageDetail({ msg, onBack, onDeleted, showToast }) {
  const [replyText,    setReplyText]    = useState("");
  const [replying,     setReplying]     = useState(false);
  const [localMsg,     setLocalMsg]     = useState(msg);
  const [deleting,     setDeleting]     = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await replyMessage(localMsg._id, replyText.trim());
      setLocalMsg((p) => ({ ...p, status: "replied", replyText: replyText.trim() }));
      setReplyText("");
      showToast("Cevap e-posta olarak gönderildi.");
    } catch {
      showToast("Cevap gönderilemedi.");
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return;
    setDeleting(true);
    try {
      await deleteMessage(localMsg._id);
      showToast("Mesaj silindi.");
      onDeleted(localMsg._id);
    } catch {
      showToast("Mesaj silinemedi.");
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Üst: Geri butonu */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
        style={{ color: "#4988C5" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Gelen Kutusuna Dön
      </button>

      {/* Mesaj bilgileri */}
      <div className="rounded-2xl border border-[#DDE9F8] bg-white p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-gilroy font-bold" style={{ color: "#1B3F84" }}>
              {localMsg.subject}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="text-sm text-gray-600 font-medium">{localMsg.name}</span>
              <a
                href={`mailto:${localMsg.email}`}
                className="text-sm font-medium hover:underline"
                style={{ color: "#4988C5" }}
              >
                {localMsg.email}
              </a>
              <span className="text-sm text-gray-400">{formatDate(localMsg.createdAt)}</span>
            </div>
          </div>
          <StatusBadge status={localMsg.status} />
        </div>

        {/* Mesaj metni */}
        <div className="border-t border-[#F0F6FF] pt-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {localMsg.message}
          </p>
        </div>
      </div>

      {/* Cevap bölümü */}
      {localMsg.status === "replied" ? (
        <div className="rounded-2xl border border-[#DCFCE7] p-5 space-y-2"
          style={{ background: "#F0FDF4" }}>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs font-bold" style={{ color: "#16A34A" }}>
              Cevaplandı
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap pl-6">
            {localMsg.replyText ?? "—"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#DDE9F8] bg-white p-6 space-y-4">
          <p className="text-xs font-semibold" style={{ color: "#1B3F84" }}>Cevap Yaz</p>
          <textarea
            rows={6}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Cevabınızı yazın…"
            className="w-full px-4 py-3 text-sm text-gray-700 bg-white border border-[#DDE9F8]
                       rounded-xl outline-none resize-none placeholder:text-gray-300 transition-all
                       focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]"
          />
          <div className="flex justify-end">
            <button
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                         text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(90deg, #1B3F84, #4988C5)" }}
            >
              {replying ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Gönderiliyor…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  E-posta Olarak Gönder
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Sil butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                     text-red-500 border border-red-100 bg-red-50 hover:bg-red-100
                     transition-colors disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
          {deleting ? "Siliniyor…" : "Mesajı Sil"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
const FILTERS = [
  { label: "Tümü",          value: undefined     },
  { label: "Okunmamış",     value: "new"         },
  { label: "Cevaplananlar", value: "replied"     },
];

export default function MessagesAdminPage() {
  const [messages,         setMessages]         = useState([]);
  const [unreadCount,      setUnreadCount]      = useState(0);
  const [isLoading,        setIsLoading]        = useState(true);
  const [activeFilter,     setActiveFilter]     = useState(undefined);
  const [selectedMessage,  setSelectedMessage]  = useState(null);
  const [toast,            setToast]            = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [msgRes, cntRes] = await Promise.all([
        getMessages(activeFilter ? { status: activeFilter } : undefined),
        getUnreadCount(),
      ]);
      const raw  = msgRes?.data ?? msgRes;
      const list = raw?.data?.messages ?? raw?.messages ?? raw?.data ?? raw;
      setMessages(Array.isArray(list) ? list : []);

      const cntRaw = cntRes?.data ?? cntRes;
      setUnreadCount(cntRaw?.data?.count ?? cntRaw?.count ?? 0);
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSelect = useCallback(async (msg) => {
    setSelectedMessage(msg);
    if (msg.status === "new") {
      try {
        await markAsRead(msg._id);
        setMessages((prev) =>
          prev.map((m) => m._id === msg._id ? { ...m, status: "read" } : m)
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return;
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      showToast("Mesaj silindi.");
    } catch {
      showToast("Mesaj silinemedi.");
    }
  }, []);

  const handleDetailDeleted = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m._id !== id));
    setSelectedMessage(null);
  }, []);

  /* ── Detay görünümü ──────────────────────────────────────────────────────── */
  if (selectedMessage) {
    return (
      <div className="p-6 lg:p-8">
        <Toast msg={toast} onClose={() => setToast(null)} />
        <MessageDetail
          msg={selectedMessage}
          onBack={() => setSelectedMessage(null)}
          onDeleted={handleDetailDeleted}
          showToast={showToast}
        />
      </div>
    );
  }

  /* ── Liste görünümü ──────────────────────────────────────────────────────── */
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Toast msg={toast} onClose={() => setToast(null)} />

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#4988C5" }}>
            İletişim
          </p>
          <h1 className="text-2xl font-gilroy font-bold flex items-center gap-3"
            style={{ color: "#1B3F84" }}>
            Gelen Kutusu
            {unreadCount > 0 && (
              <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            İletişim formundan gelen mesajlar.
          </p>
        </div>

        {/* Yenile */}
        <button
          onClick={load}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl
                     text-sm font-semibold border transition-all hover:shadow-md"
          style={{ borderColor: "#DDE9F8", color: "#4988C5" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Yenile
        </button>
      </motion.div>

      {/* Filtre butonları */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(f.value)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={
              activeFilter === f.value
                ? { background: "#1B3F84", color: "#fff" }
                : { background: "#DDE9F8", color: "#4988C5" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} i={i} />)
        ) : messages.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#DDE9F8" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4988C5" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#1B3F84" }}>
                Henüz mesaj yok
              </p>
              <p className="text-xs text-gray-400 mt-1">
                İletişim formundan gelen mesajlar burada görünecek.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageRow
              key={msg._id}
              msg={msg}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
