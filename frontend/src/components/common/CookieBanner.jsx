import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "iscev_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4 pointer-events-none"
        >
          <div
            className="pointer-events-auto max-w-4xl mx-auto rounded-2xl shadow-2xl
                       flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-6
                       border border-white/10"
            style={{ background: "#1B3F84" }}
          >
            {/* İkon */}
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10" />
                <path d="M12 8v4l3 3" />
                <circle cx="19" cy="19" r="3" />
              </svg>
            </div>

            {/* Metin */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white mb-1">
                Çerezler ve Kişisel Veriler
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(221,233,248,0.80)" }}>
                Sitemizi daha iyi bir deneyim sunmak için çerezler kullanıyoruz. Devam ederek{" "}
                <Link
                  to="/cerez-politikasi"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                  style={{ color: "#DDE9F8" }}
                >
                  Çerez Politikamızı
                </Link>{" "}
                ve{" "}
                <Link
                  to="/kvkk"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                  style={{ color: "#DDE9F8" }}
                >
                  KVKK Aydınlatma Metnimizi
                </Link>{" "}
                kabul etmiş sayılırsınız.
              </p>
            </div>

            {/* Butonlar */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={decline}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold
                           border transition-all duration-150 hover:bg-white/10"
                style={{ borderColor: "rgba(221,233,248,0.3)", color: "rgba(221,233,248,0.75)" }}
              >
                Reddet
              </button>
              <button
                onClick={accept}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold
                           bg-white transition-all duration-150 hover:bg-[#DDE9F8]"
                style={{ color: "#1B3F84" }}
              >
                Kabul Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
