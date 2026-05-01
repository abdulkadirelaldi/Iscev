const express   = require('express');
const rateLimit  = require('express-rate-limit');
const { login, logout, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Login brute-force koruması: 15 dakika içinde 10 başarısız denemede kilitle
// Test ortamında devre dışı — tekrarlı test çalıştırmaları limiti tetikler
const loginLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs:    15 * 60 * 1000,
      max:         10,
      standardHeaders: true,
      legacyHeaders:   false,
      message: {
        success: false,
        error:   'TOO_MANY_REQUESTS',
        message: 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
      },
    });

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Admin girişi
 *     description: Geçerli kimlik bilgileriyle giriş yapın. Token httpOnly cookie olarak set edilir.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:    { type: string }
 *                         name:  { type: string }
 *                         email: { type: string }
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *       429:
 *         description: Çok fazla deneme
 */
router.post('/login',           loginLimiter, login);
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Çıkış yap
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Çıkış başarılı — cookie temizlendi
 */
router.post('/logout',          protect, logout);
router.get('/me',               protect, getMe);
router.put('/profile',          protect, updateProfile);
router.put('/change-password',  protect, changePassword);

module.exports = router;
