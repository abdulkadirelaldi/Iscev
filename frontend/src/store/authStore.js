import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Token artık httpOnly cookie'de tutulur — JS erişemez, XSS'e karşı güvenli.
// State sadece UI için gerekli admin bilgilerini ve oturum durumunu saklar.
const useAuthStore = create(
  persist(
    (set) => ({
      /* ── State ─────────────────────────────────────────────────────────── */
      admin:           null,   // { id, name, email }
      isAuthenticated: false,

      /* ── Actions ───────────────────────────────────────────────────────── */
      login: ({ admin }) =>
        set({
          admin,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          admin:           null,
          isAuthenticated: false,
        }),

      updateAdmin: (updates) =>
        set((state) => ({
          admin: state.admin ? { ...state.admin, ...updates } : null,
        })),
    }),
    {
      name:    "iscev_admin_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        admin:           state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
