import { useState, useRef, useCallback, useId } from "react";

/* ─── Kabul edilen MIME tipleri ve uzantılar ──────────────────────────────── */
const ACCEPT_MAP = {
  image: { mime: "image/jpeg,image/png,image/webp", label: "JPG, PNG, WEBP" },
  pdf:   { mime: "application/pdf",                 label: "PDF"            },
  any:   { mime: "image/jpeg,image/png,image/webp,application/pdf", label: "JPG, PNG, WEBP, PDF" },
};

/* ─── Boyut formatla ──────────────────────────────────────────────────────── */
const fmtSize = (bytes) => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

/* ─── Yükleme İkonu ───────────────────────────────────────────────────────── */
function UploadIcon({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

/* ─── PDF Doküman İkonu ───────────────────────────────────────────────────── */
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9"  x2="8" y2="9"  />
    </svg>
  );
}

/* ─── X İkonu ─────────────────────────────────────────────────────────────── */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Önizleme Kartı ──────────────────────────────────────────────────────── */
function PreviewCard({ file, previewUrl, onRemove }) {
  const isPdf = file.type === "application/pdf";

  return (
    <div className="relative flex items-center gap-3 p-3 rounded-xl border border-[#DDE9F8] bg-[#F4F9FF] group">
      {/* Görsel veya PDF ikonu */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: isPdf ? "#1B3F84" : undefined }}
      >
        {isPdf ? (
          <DocIcon className="text-white w-6 h-6" />
        ) : (
          <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Bilgi */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1B3F84] truncate font-gilroy">{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{fmtSize(file.size)}</p>
      </div>

      {/* Sil */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Dosyayı kaldır"
        className="
          shrink-0 w-6 h-6 rounded-full flex items-center justify-center
          bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500
          transition-colors duration-150
        "
      >
        <XIcon />
      </button>
    </div>
  );
}

/* ─── İlerleme Çubuğu ─────────────────────────────────────────────────────── */
function ProgressBar({ value }) {
  return (
    <div className="w-full h-1.5 bg-[#DDE9F8] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${value}%`, background: "#1B3F84" }}
      />
    </div>
  );
}

/* ─── FileUploader ────────────────────────────────────────────────────────── */
/**
 * @param {"image"|"pdf"|"any"}  accept       — Kabul edilen dosya tipi
 * @param {boolean}              multiple      — Çoklu seçim
 * @param {number}               maxSizeMB     — Maks. dosya boyutu (MB)
 * @param {function}             onChange      — Seçilen File[] dizisini üst bileşene iletir
 * @param {number}               [progress]    — 0-100 yükleme ilerlemesi (opsiyonel)
 * @param {string}               [error]       — Dışarıdan gelen hata mesajı
 * @param {string}               [label]       — Alan etiketi
 * @param {boolean}              [disabled]
 */
export default function FileUploader({
  accept     = "any",
  multiple   = false,
  maxSizeMB  = 20,
  onChange,
  progress,
  error: externalError,
  label,
  disabled   = false,
}) {
  const inputId   = useId();
  const inputRef  = useRef(null);

  const [isDragging, setIsDragging]   = useState(false);
  const [files,      setFiles]        = useState([]);       // { file, previewUrl }[]
  const [localError, setLocalError]   = useState(null);

  const acceptStr = ACCEPT_MAP[accept]?.mime ?? ACCEPT_MAP.any.mime;
  const acceptLbl = ACCEPT_MAP[accept]?.label ?? ACCEPT_MAP.any.label;
  const errorMsg  = externalError ?? localError;

  /* ── Doğrulama & state güncelle ─────────────────────────────────────────── */
  const processFiles = useCallback(
    (incoming) => {
      setLocalError(null);
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid    = [];

      for (const f of incoming) {
        if (f.size > maxBytes) {
          setLocalError(`"${f.name}" dosyası ${maxSizeMB} MB sınırını aşıyor.`);
          continue;
        }
        const previewUrl = f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
        valid.push({ file: f, previewUrl });
      }

      if (!valid.length) return;

      const next = multiple ? [...files, ...valid] : [valid[0]];
      setFiles(next);
      onChange?.(next.map((e) => e.file));
    },
    [files, maxSizeMB, multiple, onChange]
  );

  /* ── Drag & Drop handlers ────────────────────────────────────────────────── */
  const onDragOver  = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true);  };
  const onDragLeave = ()  => setIsDragging(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    processFiles([...e.dataTransfer.files]);
  };

  /* ── Input change ────────────────────────────────────────────────────────── */
  const onInputChange = (e) => processFiles([...e.target.files]);

  /* ── Dosya kaldır ────────────────────────────────────────────────────────── */
  const removeFile = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onChange?.(next.map((e) => e.file));
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasFiles     = files.length > 0;
  const showProgress = typeof progress === "number" && progress > 0 && progress < 100;

  return (
    <div className="w-full font-gilroy space-y-3">
      {/* Etiket */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold"
          style={{ color: "#1B3F84" }}
        >
          {label}
        </label>
      )}

      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Dosya yükleme alanı"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-3",
          "w-full rounded-2xl border-2 border-dashed px-6 py-10",
          "cursor-pointer transition-all duration-200 select-none",
          isDragging && !disabled
            ? "border-[#1B3F84] bg-[#EBF2FF] scale-[1.01]"
            : "border-[#B8D0EE] bg-[#F8FBFF] hover:border-[#4988C5] hover:bg-[#F0F7FF]",
          disabled && "opacity-50 cursor-not-allowed",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptStr}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={onInputChange}
        />

        {/* Bulut yükleme ikonu */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl transition-colors duration-200"
          style={{ background: isDragging ? "#1B3F84" : "#DDE9F8" }}
        >
          <UploadIcon
            className={`w-7 h-7 transition-colors duration-200 ${isDragging ? "text-white" : "text-[#4988C5]"}`}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold" style={{ color: "#1B3F84" }}>
            {isDragging ? "Dosyayı bırakın" : "Dosyayı sürükleyin veya tıklayın"}
          </p>
          <p className="text-xs text-gray-400">
            {acceptLbl} &nbsp;·&nbsp; Maks. {maxSizeMB} MB
            {multiple && " · Çoklu seçim"}
          </p>
        </div>
      </div>

      {/* Seçilen dosyalar */}
      {hasFiles && (
        <div className="space-y-2">
          {files.map(({ file, previewUrl }, idx) => (
            <PreviewCard
              key={`${file.name}-${idx}`}
              file={file}
              previewUrl={previewUrl}
              onRemove={() => removeFile(idx)}
            />
          ))}
        </div>
      )}

      {/* Yükleme ilerleme çubuğu */}
      {showProgress && (
        <div className="space-y-1">
          <ProgressBar value={progress} />
          <p className="text-xs text-right font-medium" style={{ color: "#4988C5" }}>
            %{progress} yüklendi
          </p>
        </div>
      )}

      {/* Hata */}
      {errorMsg && (
        <p className="text-xs font-medium text-red-500 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
