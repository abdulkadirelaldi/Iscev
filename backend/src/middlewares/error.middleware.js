const { MulterError } = require('multer');

// ─── Multer hata kodları → HTTP 400/413/415 ────────────────────────────────
const MULTER_MAP = {
  LIMIT_FILE_SIZE: {
    statusCode: 413,
    code: 'FILE_TOO_LARGE',
    message: 'Dosya çok büyük. Maksimum boyutlar: Görsel 5 MB, PDF 50 MB, Video 100 MB.',
  },
  LIMIT_FILE_COUNT: {
    statusCode: 400,
    code: 'TOO_MANY_FILES',
    message: 'Tek seferde yüklenebilecek dosya sayısı aşıldı.',
  },
  LIMIT_UNEXPECTED_FILE: {
    statusCode: 400,
    code: 'UNEXPECTED_FILE_FIELD',
    message: 'Beklenmeyen dosya alanı. Kabul edilen alan adlarını kontrol edin.',
  },
  LIMIT_PART_COUNT: {
    statusCode: 400,
    code: 'TOO_MANY_PARTS',
    message: 'Form bölümü sayısı izin verilen sınırı aştı.',
  },
  LIMIT_FIELD_KEY: {
    statusCode: 400,
    code: 'FIELD_NAME_TOO_LONG',
    message: 'Form alanı adı çok uzun.',
  },
  LIMIT_FIELD_VALUE: {
    statusCode: 400,
    code: 'FIELD_VALUE_TOO_LONG',
    message: 'Form alanı değeri çok uzun.',
  },
};

// ─── Mongoose hata ayrıştırıcıları ────────────────────────────────────────

/** Geçersiz MongoDB ObjectId veya tip uyumsuzluğu */
const handleCastError = (err) => ({
  statusCode: 400,
  code: 'INVALID_ID',
  message: `'${err.value}' geçerli bir ID değil.`,
});

/** Mongoose şema validasyon hatası — tüm alan hatalarını birleştirir */
const handleValidationError = (err) => {
  const messages = Object.values(err.errors)
    .map((e) => e.message)
    .join(' | ');
  return {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: messages,
  };
};

/** Duplicate key (unique index) ihlali — 11000 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'alan';
  const value = err.keyValue?.[field] ?? '';
  return {
    statusCode: 409,
    code: 'DUPLICATE_KEY',
    message: `'${value}' değeri '${field}' alanında zaten kayıtlı.`,
  };
};

// ─── Global Express hata yakalayıcısı ────────────────────────────────────
// 4 parametreli middleware — Express bunu error handler olarak tanır.
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  // 1. Multer hataları
  if (err instanceof MulterError) {
    const mapped = MULTER_MAP[err.code] ?? {
      statusCode: 400,
      code: 'UPLOAD_ERROR',
      message: err.message,
    };
    return res.status(mapped.statusCode).json({ success: false, ...mapped });
  }

  // 2. Dosya türü reddi (multer fileFilter'dan fırlatılan özel hata)
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(415).json({
      success: false,
      code: 'INVALID_FILE_TYPE',
      message: err.message,
    });
  }

  // 3. Bozuk JSON body (express.json parse hatası)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'İstek gövdesi geçerli bir JSON formatında değil.',
    });
  }

  // 4. Mongoose — CastError (geçersiz ObjectId vb.)
  if (err.name === 'CastError') {
    const { statusCode, code, message } = handleCastError(err);
    return res.status(statusCode).json({ success: false, error: code, message });
  }

  // 5. Mongoose — ValidationError (şema ihlalleri)
  if (err.name === 'ValidationError') {
    const { statusCode, code, message } = handleValidationError(err);
    return res.status(statusCode).json({ success: false, error: code, message });
  }

  // 6. MongoDB — Duplicate key (unique constraint ihlali)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const { statusCode, code, message } = handleDuplicateKeyError(err);
    return res.status(statusCode).json({ success: false, error: code, message });
  }

  // 7. Servis katmanından fırlatılan özel hatalar (statusCode + code ile)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code || 'APP_ERROR',
      message: err.message,
    });
  }

  // 8. Bilinmeyen / beklenmeyen hatalar
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[errorMiddleware]', err);

  return res.status(500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: isProd
      ? 'Beklenmeyen bir sunucu hatası oluştu.'
      : err.message,
  });
};

module.exports = errorMiddleware;
