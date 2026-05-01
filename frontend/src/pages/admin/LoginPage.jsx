import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth.api";
import useAuthStore from "../../store/authStore";

export default function LoginPage() {
  const navigate    = useNavigate();
  const loginStore  = useAuthStore((s) => s.login);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      loginStore({ admin: data.admin });
      navigate("/admin/urunler", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ?? "E-posta veya şifre hatalı."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #DDE9F8 0%, #f0f6ff 100%)" }}
    >
      <div className="w-full max-w-md">

        {/* ── Logo / Başlık ───────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl mb-4 shadow-lg"
            style={{ background: "#1B3F84" }}
          >
            <img
              src="/logo-white.svg"
              alt="İSÇEV"
              className="h-10 w-auto"
            />
          </div>
          <h1
            className="text-2xl font-gilroy font-bold leading-tight"
            style={{ color: "#1B3F84" }}
          >
            İSÇEV Yönetim Paneli
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Devam etmek için giriş yapın
          </p>
        </div>

        {/* ── Kart ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#DDE9F8]">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* E-posta */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold"
                style={{ color: "#1B3F84" }}
              >
                E-posta Adresi
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#4988C5" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@iscev.com.tr"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm text-gray-700
                             bg-white outline-none transition-all duration-150
                             placeholder:text-gray-300
                             focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]"
                  style={{ borderColor: "#DDE9F8" }}
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold"
                style={{ color: "#1B3F84" }}
              >
                Şifre
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#4988C5" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border text-sm text-gray-700
                             bg-white outline-none transition-all duration-150
                             placeholder:text-gray-300
                             focus:ring-2 focus:ring-[#4988C5]/30 focus:border-[#4988C5]"
                  style={{ borderColor: "#DDE9F8" }}
                />
                {/* Göster / gizle */}
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity
                             hover:opacity-70"
                  style={{ color: "#4988C5" }}
                  tabIndex={-1}
                  aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hata mesajı */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "#FEE2E2", color: "#B91C1C" }}
                role="alert"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Giriş butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                         text-sm font-bold text-white transition-all duration-200
                         hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
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
                  Giriş yapılıyor…
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>

          </form>
        </div>

        {/* ── Alt not ─────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-gray-400 mt-6">
          İSÇEV Arıtma ve Çevre Teknolojileri &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
