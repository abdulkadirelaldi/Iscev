import { motion, AnimatePresence } from "framer-motion";

/**
 * BulkActionBar
 * Seçili öğe sayısı > 0 olduğunda ekranın altında gösterilir.
 *
 * Props:
 *   count       {number}            — Seçili öğe sayısı
 *   onClear     {() => void}        — Seçimi temizle
 *   actions     {Array<{ label, icon?, onClick, danger? }>}
 */
export default function BulkActionBar({ count, onClear, actions = [] }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{   y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2
                     flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl
                     border border-white/10"
          style={{ background: "#1B3F84" }}
        >
          {/* Seçili sayısı */}
          <span className="flex items-center gap-2 text-sm font-semibold text-white pr-3 border-r border-white/20">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: "#4988C5" }}>
              {count}
            </span>
            öğe seçildi
          </span>

          {/* Aksiyonlar */}
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold
                         transition-all duration-150 hover:opacity-90 active:scale-95"
              style={
                action.danger
                  ? { background: "#DC2626",          color: "#fff" }
                  : { background: "rgba(255,255,255,0.12)", color: "#fff" }
              }
            >
              {action.icon && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d={action.icon} />
                </svg>
              )}
              {action.label}
            </button>
          ))}

          {/* Seçimi temizle */}
          <button
            onClick={onClear}
            className="ml-1 p-1.5 rounded-xl transition-all hover:bg-white/10"
            title="Seçimi temizle"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-70">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
