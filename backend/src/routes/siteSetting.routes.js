const express = require('express');
const {
  getSettings,
  updateCorporateSection,
  updateContactInfo,
  addCarouselItems,
  updateCarouselItem,
  removeCarouselItem,
  updateIntroVideo,
  deleteIntroVideo,
} = require('../controllers/siteSetting.controller');
const { protect }      = require('../middlewares/auth.middleware');
const { uploadImage, uploadVideo } = require('../config/multer');

const router = express.Router();

// ─── Public ──────────────────────────────────────────────────────────────────
router.get('/', getSettings);

// ─── Private — İletişim Bilgileri ────────────────────────────────────────────
router.put('/corporate', protect, updateCorporateSection);
router.put('/contact',   protect, updateContactInfo);

// ─── Private — Carousel Yönetimi ─────────────────────────────────────────────

// Çoklu görsel yükleme: aynı field adı 'carouselImages', max 5 adet, 5 MB/adet
router.post(
  '/carousel',
  protect,
  uploadImage.array('carouselImages', 5),
  addCarouselItems
);

// Belirli bir öğenin metadata güncellemesi (görsel yok, sadece JSON body)
router.patch('/carousel/:itemId', protect, updateCarouselItem);

// Öğeyi diskten ve veritabanından sil
router.delete('/carousel/:itemId', protect, removeCarouselItem);

// ─── Private — Tanıtım Videosu ───────────────────────────────────────────────

// Video yükleme: .mp4, max 100 MB
router.put('/video', protect, uploadVideo.single('promoVideo'), updateIntroVideo);

// Videoyu sil
router.delete('/video', protect, deleteIntroVideo);

module.exports = router;
