const SiteSettings = require('../../models/SiteSettings.model');
const { deleteFile, toRelativePath } = require('../utils/fileHelper');

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

/**
 * Singleton kaydı döner. Yoksa 'main' instance'ı oluşturur (model static metodu).
 */
const getSettings = async () => {
  return SiteSettings.getInstance();
};

/**
 * İletişim bilgilerini günceller.
 * Sadece gönderilen alanları değiştirir, diğerlerine dokunmaz.
 */
const updateContactInfo = async (data) => {
  const settings = await SiteSettings.getInstance();
  const allowed = [
    'address', 'phone', 'email',
    'whatsappNumber', 'linkedinUrl', 'instagramUrl', 'mapEmbedUrl',
  ];

  allowed.forEach((key) => {
    if (data[key] !== undefined) settings.contactInfo[key] = data[key];
  });

  settings.markModified('contactInfo');
  await settings.save();
  return settings;
};

/**
 * Carousel'e yeni görsel(ler) ekler.
 * @param {Express.Multer.File[]} files  - req.files dizisi (uploadImage.array)
 * @param {Object[]}              metas  - Her dosya için { title, subtitle, order, isActive }
 *                                         index ile eşleşir; eksik alan default'a düşer.
 */
const addCarouselItems = async (files, metas = []) => {
  if (!files || files.length === 0) {
    throw createError('En az bir carousel görseli gereklidir.', 400, 'VALIDATION_ERROR');
  }

  const settings = await SiteSettings.getInstance();

  const newItems = files.map((file, i) => {
    const meta = metas[i] || {};
    return {
      imagePath:  toRelativePath(file.path),
      title:      meta.title    || '',
      subtitle:   meta.subtitle || '',
      order:      meta.order    !== undefined ? Number(meta.order) : settings.carousel.length + i,
      isActive:   meta.isActive !== undefined
        ? (meta.isActive === 'true' || meta.isActive === true)
        : true,
    };
  });

  settings.carousel.push(...newItems);
  await settings.save();
  return settings;
};

/**
 * Belirli bir carousel öğesinin metadata'sını günceller (görsel değişmez).
 */
const updateCarouselItem = async (itemId, data) => {
  const settings = await SiteSettings.getInstance();
  const item = settings.carousel.id(itemId);

  if (!item) throw createError('Carousel öğesi bulunamadı.', 404, 'NOT_FOUND');

  if (data.title    !== undefined) item.title    = data.title;
  if (data.subtitle !== undefined) item.subtitle = data.subtitle;
  if (data.order    !== undefined) item.order    = Number(data.order);
  if (data.isActive !== undefined)
    item.isActive = data.isActive === 'true' || data.isActive === true;

  await settings.save();
  return settings;
};

/**
 * Carousel öğesini siler; ilişkili görsel dosyasını da diskten kaldırır.
 */
const removeCarouselItem = async (itemId) => {
  const settings = await SiteSettings.getInstance();
  const item = settings.carousel.id(itemId);

  if (!item) throw createError('Carousel öğesi bulunamadı.', 404, 'NOT_FOUND');

  await deleteFile(item.imagePath);
  item.deleteOne(); // Mongoose subdocument remove
  await settings.save();
  return settings;
};

/**
 * Tanıtım videosunu günceller.
 * Eski video diskten silinir, yeni yol kaydedilir.
 */
const updateIntroVideo = async (videoPath) => {
  const settings = await SiteSettings.getInstance();

  if (settings.introVideoPath) {
    await deleteFile(settings.introVideoPath);
  }

  settings.introVideoPath = videoPath;
  await settings.save();
  return settings;
};

/**
 * Tanıtım videosunu diskten ve veritabanından siler.
 */
const deleteIntroVideo = async () => {
  const settings = await SiteSettings.getInstance();

  if (!settings.introVideoPath) {
    throw createError('Silinecek tanıtım videosu bulunamadı.', 404, 'NOT_FOUND');
  }

  await deleteFile(settings.introVideoPath);
  settings.introVideoPath = null;
  await settings.save();
  return settings;
};

const updateCorporateSection = async (data) => {
  const settings = await SiteSettings.getInstance();
  const allowed = ['subtitle', 'title', 'bodyText', 'stats'];
  allowed.forEach((key) => {
    if (data[key] !== undefined) settings.corporateSection[key] = data[key];
  });
  settings.markModified('corporateSection');
  await settings.save();
  return settings;
};

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
