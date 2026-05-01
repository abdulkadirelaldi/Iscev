const path = require('path');
const fs = require('fs');

// backend/ kök dizini
const BACKEND_ROOT = path.join(__dirname, '../..');

/**
 * 'uploads/images/xxx.jpg' formatındaki göreli yoldaki dosyayı
 * fs.promises.unlink ile asenkron olarak siler.
 *
 * - ENOENT (dosya zaten yok)  → sessiz uyarı, uygulama çökmez.
 * - Diğer hatalar             → konsola hata loglanır, uygulama çökmez.
 * - relativePath null/boş    → işlem yapılmaz.
 *
 * @param {string|null} relativePath
 * @returns {Promise<void>}
 */
const deleteFile = async (relativePath) => {
  if (!relativePath) return;

  const fullPath = path.join(BACKEND_ROOT, relativePath);

  try {
    await fs.promises.unlink(fullPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Dosya zaten silinmiş veya hiç oluşturulmamış — normal akış
      console.warn(`[fileHelper] Dosya bulunamadı (zaten yok): ${fullPath}`);
    } else {
      // İzin hatası, disk hatası vb. — logla ama fırlatma
      console.error(`[fileHelper] Dosya silinemedi: ${fullPath} — ${err.message}`);
    }
  }
};

/**
 * Multer'ın döndürdüğü mutlak OS yolunu 'uploads/...' göreli yoluna çevirir.
 * Windows path separator'larını (\\) normalize eder.
 *
 * @param {string} absolutePath
 * @returns {string}
 */
const toRelativePath = (absolutePath) => {
  const normalized = absolutePath.replace(/\\/g, '/');
  const idx = normalized.indexOf('uploads/');
  return idx !== -1 ? normalized.slice(idx) : normalized;
};

module.exports = { deleteFile, toRelativePath };
