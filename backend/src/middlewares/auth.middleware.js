const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'iscev_token';

/**
 * JWT koruması: önce httpOnly cookie, sonra Authorization Bearer header'ına bakar.
 * Başarılı doğrulamada req.admin'e decode edilmiş payload'ı ekler.
 */
const protect = (req, res, next) => {
  // 1. httpOnly cookie (tercih edilen yol — XSS'e karşı güvenli)
  let token = req.cookies?.[COOKIE_NAME] ?? null;

  // 2. Authorization header fallback (API client / mobil uygulama için)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error:   'UNAUTHORIZED',
      message: 'Bu işlem için yetkilendirme gereklidir.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      error:   isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: isExpired
        ? 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
        : 'Geçersiz token.',
    });
  }
};

module.exports = { protect };
