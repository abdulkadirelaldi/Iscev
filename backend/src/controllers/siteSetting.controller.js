const asyncHandler                   = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const siteSettingService             = require('../services/siteSetting.service');

/**
 * @route   GET /api/v1/site-settings
 * @desc    Tüm site ayarlarını getir (carousel, video, iletişim).
 * @access  Public
 */
const getSettings = asyncHandler(async (req, res) => {
  const settings = await siteSettingService.getSettings();
  res.status(200).json({
    success: true,
    message: 'Site ayarları getirildi.',
    data: {
      carousel:          settings.carousel,
      contactInfo:       settings.contactInfo,
      introVideoPath:    settings.introVideoPath,
      corporateSection:  settings.corporateSection,
    },
  });
});

const updateCorporateSection = asyncHandler(async (req, res) => {
  const settings = await siteSettingService.updateCorporateSection(req.body);
  res.status(200).json({
    success: true,
    message: 'Kurumsal bölüm güncellendi.',
    data: { corporateSection: settings.corporateSection },
  });
});

/**
 * @route   PUT /api/v1/site-settings/contact
 * @desc    İletişim bilgilerini güncelle (address, phone, email, whatsappNumber…).
 * @access  Private (Admin)
 */
const updateContactInfo = asyncHandler(async (req, res) => {
  const settings = await siteSettingService.updateContactInfo(req.body);
  res.status(200).json({
    success: true,
    message: 'İletişim bilgileri güncellendi.',
    data: { contactInfo: settings.contactInfo },
  });
});

/**
 * @route   POST /api/v1/site-settings/carousel
 * @desc    Carousel'e yeni görsel(ler) ekle.
 *          Gövdede isteğe bağlı:
 *            titles[]    — Her görsel için başlık (index sırasıyla eşleşir)
 *            subtitles[] — Her görsel için alt başlık
 *            orders[]    — Sıralama numarası
 * @access  Private (Admin)
 */
const addCarouselItems = asyncHandler(async (req, res) => {
  const files = req.files; // uploadImage.array('carouselImages', 5) sonucu

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'En az bir carousel görseli yüklenmelidir.',
    });
  }

  // Çoklu metadata'yı index bazlı eşleştir
  const titles    = [].concat(req.body.titles    || []);
  const subtitles = [].concat(req.body.subtitles || []);
  const orders    = [].concat(req.body.orders    || []);

  const metas = files.map((_, i) => ({
    title:    titles[i]    || '',
    subtitle: subtitles[i] || '',
    order:    orders[i],
  }));

  const settings = await siteSettingService.addCarouselItems(files, metas);
  res.status(201).json({
    success: true,
    message: `${files.length} carousel görseli eklendi.`,
    data: { carousel: settings.carousel },
  });
});

/**
 * @route   PATCH /api/v1/site-settings/carousel/:itemId
 * @desc    Carousel öğesinin metadata'sını güncelle (title, subtitle, order, isActive).
 *          Görsel değişmez; sadece metin/sıralama bilgisi güncellenir.
 * @access  Private (Admin)
 */
const updateCarouselItem = asyncHandler(async (req, res) => {
  const settings = await siteSettingService.updateCarouselItem(req.params.itemId, req.body);
  res.status(200).json({
    success: true,
    message: 'Carousel öğesi güncellendi.',
    data: { carousel: settings.carousel },
  });
});

/**
 * @route   DELETE /api/v1/site-settings/carousel/:itemId
 * @desc    Carousel öğesini ve görselini sil.
 * @access  Private (Admin)
 */
const removeCarouselItem = asyncHandler(async (req, res) => {
  const settings = await siteSettingService.removeCarouselItem(req.params.itemId);
  res.status(200).json({
    success: true,
    message: 'Carousel görseli silindi.',
    data: { carousel: settings.carousel },
  });
});

/**
 * @route   PUT /api/v1/site-settings/video
 * @desc    Tanıtım videosunu yükle / değiştir (eski video diskten silinir).
 * @access  Private (Admin)
 */
const updateIntroVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Video dosyası zorunludur.',
    });
  }

  const videoPath = toRelativePath(req.file.path);
  const settings  = await siteSettingService.updateIntroVideo(videoPath);

  res.status(200).json({
    success: true,
    message: 'Tanıtım videosu güncellendi.',
    data: { introVideoPath: settings.introVideoPath },
  });
});

/**
 * @route   DELETE /api/v1/site-settings/video
 * @desc    Tanıtım videosunu diskten ve veritabanından sil.
 * @access  Private (Admin)
 */
const deleteIntroVideo = asyncHandler(async (req, res) => {
  await siteSettingService.deleteIntroVideo();
  res.status(200).json({
    success: true,
    message: 'Tanıtım videosu silindi.',
    data: null,
  });
});

module.exports = {
  getSettings,
  updateCorporateSection,
  updateContactInfo,
  addCarouselItems,
  updateCarouselItem,
  removeCarouselItem,
  updateIntroVideo,
  deleteIntroVideo,
};
