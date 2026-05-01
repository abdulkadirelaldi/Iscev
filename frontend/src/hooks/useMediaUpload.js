import { useState, useCallback, useRef } from "react";
import api from "../api/axiosInstance";

/**
 * useMediaUpload
 * ─────────────────────────────────────────────────────────────────────────────
 * Multer destekli backend endpoint'lerine multipart/form-data ile dosya
 * yükleme işlemini ve durumunu yöneten custom hook.
 *
 * @param {string} endpoint  — Yükleme URL'i (örn: "/hero", "/products")
 *
 * Dönen değerler:
 *   upload(file, fields?)  — Yüklemeyi başlatır; çözümlenen değer API yanıtıdır
 *   uploadMultiple(files, fields?) — Birden fazla dosya ile çalışır
 *   isLoading              — Yükleme devam ediyor mu?
 *   progress               — 0-100 arası yüzde
 *   error                  — Hata mesajı string veya null
 *   reset()                — State'i sıfırla
 *   cancel()               — Devam eden isteği iptal et
 */
export default function useMediaUpload(endpoint) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState(null);

  const controllerRef = useRef(null);

  /* ── Yardımcı: FormData oluştur ─────────────────────────────────────────── */
  const buildFormData = (files, fields = {}) => {
    const fd = new FormData();

    /* Dosyalar — tek dosya veya dizi */
    if (Array.isArray(files)) {
      files.forEach((f) => fd.append("files", f));
    } else if (files) {
      fd.append("file", files);
    }

    /* Ek metin alanları */
    Object.entries(fields).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        fd.append(key, typeof val === "object" ? JSON.stringify(val) : val);
      }
    });

    return fd;
  };

  /* ── Tek dosya yükleme ──────────────────────────────────────────────────── */
  const upload = useCallback(
    async (file, fields = {}) => {
      setIsLoading(true);
      setProgress(0);
      setError(null);
      controllerRef.current = new AbortController();

      try {
        const formData = buildFormData(file, fields);

        const { data } = await api.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal:  controllerRef.current.signal,
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          },
        });

        setProgress(100);
        return data;
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return null;
        const msg = err.response?.data?.message ?? err.message ?? "Yükleme başarısız.";
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint]
  );

  /* ── Çoklu dosya yükleme ────────────────────────────────────────────────── */
  const uploadMultiple = useCallback(
    (files, fields = {}) => upload(files, fields),
    [upload]
  );

  /* ── İptal ──────────────────────────────────────────────────────────────── */
  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setIsLoading(false);
    setProgress(0);
  }, []);

  /* ── State sıfırla ──────────────────────────────────────────────────────── */
  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { upload, uploadMultiple, isLoading, progress, error, reset, cancel };
}
