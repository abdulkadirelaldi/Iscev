const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const Admin  = require('../../models/admin.model');
const asyncHandler = require('../utils/asyncHandler');

const COOKIE_NAME    = 'iscev_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 gün

const cookieOptions = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge:   COOKIE_MAX_AGE,
  path:     '/',
});

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error:   'VALIDATION_ERROR',
      message: 'Email ve şifre zorunludur.',
    });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

  if (!admin) {
    return res.status(401).json({
      success: false,
      error:   'INVALID_CREDENTIALS',
      message: 'Email veya şifre hatalı.',
    });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error:   'INVALID_CREDENTIALS',
      message: 'Email veya şifre hatalı.',
    });
  }

  if (!admin.isActive) {
    return res.status(403).json({
      success: false,
      error:   'ACCOUNT_DISABLED',
      message: 'Hesabınız devre dışı bırakılmıştır.',
    });
  }

  const token = jwt.sign(
    { id: admin._id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // httpOnly cookie ile gönder — JS erişemez, XSS korumalı
  res.cookie(COOKIE_NAME, token, cookieOptions());

  res.status(200).json({
    success: true,
    message: 'Giriş başarılı.',
    data: {
      admin: {
        id:    admin._id,
        name:  admin.name,
        email: admin.email,
      },
    },
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @access  Private (Admin)
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(200).json({ success: true, message: 'Çıkış yapıldı.' });
});

/**
 * @route   GET /api/v1/auth/me
 * @access  Private (Admin)
 */
const getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Admin bulunamadı.' });
  }
  res.status(200).json({
    success: true,
    message: 'Profil getirildi.',
    data: { admin: { id: admin._id, name: admin.name, email: admin.email } },
  });
});

/**
 * @route   PUT /api/v1/auth/profile
 * @access  Private (Admin)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) {
    return res.status(400).json({
      success: false, error: 'VALIDATION_ERROR',
      message: 'Güncellenecek en az bir alan gereklidir.',
    });
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Admin bulunamadı.' });
  }

  if (name)  admin.name  = name.trim();
  if (email) admin.email = email.toLowerCase().trim();

  await admin.save();
  res.status(200).json({
    success: true,
    message: 'Profil güncellendi.',
    data: { admin: { id: admin._id, name: admin.name, email: admin.email } },
  });
});

/**
 * @route   PUT /api/v1/auth/change-password
 * @access  Private (Admin)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false, error: 'VALIDATION_ERROR',
      message: 'Mevcut ve yeni şifre zorunludur.',
    });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false, error: 'VALIDATION_ERROR',
      message: 'Yeni şifre en az 8 karakter olmalıdır.',
    });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false, error: 'VALIDATION_ERROR',
      message: 'Yeni şifre mevcut şifreyle aynı olamaz.',
    });
  }

  const admin = await Admin.findById(req.admin.id).select('+password');
  if (!admin) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Admin bulunamadı.' });
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false, error: 'WRONG_PASSWORD',
      message: 'Mevcut şifre hatalı.',
    });
  }

  admin.password = newPassword;
  await admin.save();

  res.status(200).json({ success: true, message: 'Şifre başarıyla değiştirildi.', data: null });
});

module.exports = { login, logout, getMe, updateProfile, changePassword };
