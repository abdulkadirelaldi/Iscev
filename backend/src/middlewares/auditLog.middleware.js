const path = require('path');
const fs   = require('fs');

const LOG_DIR  = path.join(__dirname, '../../../logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

const ensureLogDir = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

/**
 * Admin aksiyonlarını audit.log dosyasına yazar.
 * Yalnızca mutasyona yol açan HTTP metodlarını (POST, PUT, PATCH, DELETE) loglar.
 *
 * Log formatı:
 * [ISO timestamp] [METHOD] [STATUS] [admin.email | anonymous] [ip] PATH
 */
const auditLog = (req, res, next) => {
  const MUTABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!MUTABLE_METHODS.includes(req.method)) {
    return next();
  }

  const startedAt = Date.now();

  res.on('finish', () => {
    ensureLogDir();

    const adminEmail = req.admin?.email ?? 'anonymous';
    const ip         = req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown';
    const duration   = Date.now() - startedAt;

    const entry = JSON.stringify({
      ts:     new Date().toISOString(),
      method: req.method,
      path:   req.originalUrl,
      status: res.statusCode,
      admin:  adminEmail,
      ip,
      ms:     duration,
    });

    fs.appendFile(LOG_FILE, entry + '\n', (err) => {
      if (err) console.error('[auditLog] Yazma hatası:', err.message);
    });
  });

  next();
};

module.exports = auditLog;
