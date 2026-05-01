const asyncHandler = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const serviceService = require('../services/service.service');

/**
 * @route   GET /api/v1/services
 * @access  Public
 */
const getServices = asyncHandler(async (req, res) => {
  const data = await serviceService.getAllServices(req.query);
  res.status(200).json({ success: true, message: 'Hizmetler getirildi.', data });
});

/**
 * @route   GET /api/v1/services/:id
 * @access  Public
 */
const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);
  res.status(200).json({ success: true, message: 'Hizmet getirildi.', data: { service } });
});

/**
 * @route   POST /api/v1/services
 * @access  Private (Admin)
 */
const createService = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Kapak görseli zorunludur.',
    });
  }

  const coverImagePath = toRelativePath(req.file.path);

  try {
    const service = await serviceService.createService({ ...req.body, coverImagePath });
    res.status(201).json({ success: true, message: 'Hizmet başarıyla oluşturuldu.', data: { service } });
  } catch (err) {
    await deleteFile(coverImagePath);
    throw err;
  }
});

/**
 * @route   PUT /api/v1/services/:id
 * @access  Private (Admin)
 */
const updateService = asyncHandler(async (req, res) => {
  const newCoverImagePath = req.file ? toRelativePath(req.file.path) : null;

  try {
    const service = await serviceService.updateService(req.params.id, req.body, newCoverImagePath);
    res.status(200).json({ success: true, message: 'Hizmet güncellendi.', data: { service } });
  } catch (err) {
    if (newCoverImagePath) await deleteFile(newCoverImagePath);
    throw err;
  }
});

/**
 * @route   DELETE /api/v1/services/:id
 * @access  Private (Admin)
 */
const deleteService = asyncHandler(async (req, res) => {
  await serviceService.deleteService(req.params.id);
  res.status(200).json({ success: true, message: 'Hizmet silindi.', data: null });
});

module.exports = { getServices, getServiceById, createService, updateService, deleteService };
