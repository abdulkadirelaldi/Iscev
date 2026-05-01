import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollUp}
          aria-label="Sayfanın başına dön"
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{   opacity: 0, scale: 0.7, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{   scale: 0.92 }}
          className="fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full
                     flex items-center justify-center shadow-lg
                     border border-white/20 transition-colors duration-150"
          style={{ background: "#1B3F84" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
