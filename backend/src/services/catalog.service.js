const Catalog = require('../../models/Catalog.model');
const { deleteFile } = require('../utils/fileHelper');

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

/**
 * Katalog listesi — dil ve isActive filtresi destekli.
 */
const getAllCatalogs = async ({ language, isActive } = {}) => {
  const filter = {};
  if (language) filter.language = language;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  return Catalog.find(filter).sort({ order: 1, createdAt: -1 });
};

/**
 * Yeni katalog oluşturur.
 * @param {object} data - { name, pdfFilePath, coverImagePath, language, isActive, order }
 */
const createCatalog = async (data) => {
  const { name, pdfFilePath, coverImagePath, language, isActive, order } = data;

  return Catalog.create({
    name,
    pdfFilePath,
    coverImagePath: coverImagePath || null,
    language: language || 'tr',
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    order: order !== undefined ? Number(order) : 0,
  });
};

/**
 * Kataloğu, PDF dosyasını ve kapak görselini (varsa) siler.
 */
const deleteCatalog = async (id) => {
  const catalog = await Catalog.findById(id);
  if (!catalog) throw createError('Katalog bulunamadı.', 404, 'NOT_FOUND');

  await Promise.all([
    deleteFile(catalog.pdfFilePath),
    deleteFile(catalog.coverImagePath),
  ]);

  await catalog.deleteOne();
};

/**
 * Kataloğun indirme sayacını bir artırır.
 * @returns {{ downloadCount: number }}
 */
const incrementDownload = async (id) => {
  const catalog = await Catalog.findByIdAndUpdate(
    id,
    { $inc: { downloadCount: 1 } },
    { new: true, select: 'downloadCount' }
  );

  if (!catalog) throw createError('Katalog bulunamadı.', 404, 'NOT_FOUND');

  return { downloadCount: catalog.downloadCount };
};

module.exports = {
  getAllCatalogs,
  createCatalog,
  deleteCatalog,
  incrementDownload,
};
