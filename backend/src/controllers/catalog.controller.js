const asyncHandler = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const catalogService = require('../services/catalog.service');

/**
 * @route   GET /api/v1/catalogs
 * @access  Public
 */
const getCatalogs = asyncHandler(async (req, res) => {
  const catalogs = await catalogService.getAllCatalogs(req.query);
  res.status(200).json({ success: true, message: 'Kataloglar getirildi.', data: { catalogs } });
});

/**
 * @route   POST /api/v1/catalogs
 * @access  Private (Admin)
 *
 * Form alanları (multipart/form-data):
 *   pdf        — .pdf dosyası (zorunlu)
 *   coverImage — görsel (opsiyonel)
 */
const createCatalog = asyncHandler(async (req, res) => {
  const files = req.files || {};

  if (!files.pdf || files.pdf.length === 0) {
    if (files.coverImage?.[0]) deleteFile(toRelativePath(files.coverImage[0].path));
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'PDF dosyası zorunludur.',
    });
  }

  const pdfFilePath = toRelativePath(files.pdf[0].path);
  const coverImagePath = files.coverImage?.[0]
    ? toRelativePath(files.coverImage[0].path)
    : null;

  const catalog = await catalogService.createCatalog({ ...req.body, pdfFilePath, coverImagePath });
  res.status(201).json({ success: true, message: 'Katalog başarıyla oluşturuldu.', data: { catalog } });
});

/**
 * @route   DELETE /api/v1/catalogs/:id
 * @access  Private (Admin)
 */
const deleteCatalog = asyncHandler(async (req, res) => {
  await catalogService.deleteCatalog(req.params.id);
  res.status(200).json({ success: true, message: 'Katalog silindi.', data: null });
});

/**
 * @route   PATCH /api/v1/catalogs/:id/download
 * @access  Public
 */
const incrementDownload = asyncHandler(async (req, res) => {
  const { downloadCount } = await catalogService.incrementDownload(req.params.id);
  res.status(200).json({
    success: true,
    message: 'İndirme sayacı güncellendi.',
    data: { downloadCount },
  });
});

module.exports = { getCatalogs, createCatalog, deleteCatalog, incrementDownload };
