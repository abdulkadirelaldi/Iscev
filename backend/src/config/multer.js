const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_BASE = path.join(__dirname, '../../uploads');

// Alt klasörün var olduğundan emin ol
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Dosya adı: zaman damgası + rastgele suffix + orijinal uzantı
const buildFilename = (file, cb) => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  cb(null, `${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
};

// --- Storage Factories ---

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_BASE, 'images');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => buildFilename(file, cb),
});

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_BASE, 'pdfs');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => buildFilename(file, cb),
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_BASE, 'videos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => buildFilename(file, cb),
});

// Karışık yükleme için dosya türüne göre otomatik klasör seçimi (SiteSettings vb.)
const mixedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    let subFolder = 'images';
    if (ext === '.pdf') subFolder = 'pdfs';
    else if (ext === '.mp4') subFolder = 'videos';
    const dir = path.join(UPLOAD_BASE, subFolder);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => buildFilename(file, cb),
});

// --- File Filters ---

// MIME type → extension eşleşmesi (çift doğrulama — sadece extension'a güvenmiyoruz)
const ALLOWED_MIME = {
  'image/jpeg':      ['.jpg', '.jpeg'],
  'image/png':       ['.png'],
  'image/webp':      ['.webp'],
  'application/pdf': ['.pdf'],
  'video/mp4':       ['.mp4'],
};

const createFileFilter = (allowedExts) => (req, file, cb) => {
  const ext      = path.extname(file.originalname).toLowerCase();
  const mime     = file.mimetype;
  const mimeExts = ALLOWED_MIME[mime] || [];

  // Extension whitelist kontrolü
  if (!allowedExts.includes(ext)) {
    const err = new Error(`İzin verilmeyen dosya türü. Kabul edilenler: ${allowedExts.join(', ')}`);
    err.code = 'INVALID_FILE_TYPE';
    return cb(err, false);
  }

  // MIME type — extension uyum kontrolü (örn: .jpg uzantılı PDF reddedilir)
  if (!mimeExts.includes(ext)) {
    const err = new Error('Dosya uzantısı içerik türüyle uyuşmuyor.');
    err.code = 'MIME_MISMATCH';
    return cb(err, false);
  }

  cb(null, true);
};

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const PDF_EXTS   = ['.pdf'];
const VIDEO_EXTS = ['.mp4'];
const ALL_EXTS   = [...IMAGE_EXTS, ...PDF_EXTS, ...VIDEO_EXTS];

// --- Multer Instances ---

/** Görsel yükleme: .jpg .jpeg .png .webp — max 5 MB */
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: createFileFilter(IMAGE_EXTS),
});

/** PDF yükleme: .pdf — max 50 MB */
const uploadPDF = multer({
  storage: pdfStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: createFileFilter(PDF_EXTS),
});

/** Video yükleme: .mp4 — max 100 MB */
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: createFileFilter(VIDEO_EXTS),
});

/** Karışık yükleme (görsel + pdf + video aynı formda) — max 100 MB */
const uploadMixed = multer({
  storage: mixedStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: createFileFilter(ALL_EXTS),
});

/**
 * Katalog yükleme: PDF (max 50 MB) + kapak görseli (max 5 MB) aynı formda.
 * fields() ile hazır middleware olarak export edilir — route'da doğrudan kullanılır.
 */
const uploadCatalog = multer({
  storage: mixedStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: createFileFilter([...PDF_EXTS, ...IMAGE_EXTS]),
}).fields([
  { name: 'pdf',        maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

module.exports = { uploadImage, uploadPDF, uploadVideo, uploadMixed, uploadCatalog };
