const asyncHandler = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const referenceService = require('../services/reference.service');

/**
 * @route   GET /api/v1/references
 * @access  Public
 */
const getReferences = asyncHandler(async (req, res) => {
  const data = await referenceService.getAllReferences(req.query);
  res.status(200).json({ success: true, message: 'Referanslar getirildi.', data });
});

/**
 * @route   GET /api/v1/references/:id
 * @access  Public
 */
const getReferenceById = asyncHandler(async (req, res) => {
  const reference = await referenceService.getReferenceById(req.params.id);
  res.status(200).json({ success: true, message: 'Referans getirildi.', data: { reference } });
});

/**
 * @route   POST /api/v1/references
 * @access  Private (Admin)
 */
const createReference = asyncHandler(async (req, res) => {
  const logoPath = req.file ? toRelativePath(req.file.path) : null;

  try {
    const reference = await referenceService.createReference({ ...req.body, logoPath });
    res.status(201).json({ success: true, message: 'Referans oluşturuldu.', data: { reference } });
  } catch (err) {
    if (logoPath) await deleteFile(logoPath);
    throw err;
  }
});

/**
 * @route   PUT /api/v1/references/:id
 * @access  Private (Admin)
 */
const updateReference = asyncHandler(async (req, res) => {
  const newLogoPath = req.file ? toRelativePath(req.file.path) : null;

  try {
    const reference = await referenceService.updateReference(req.params.id, req.body, newLogoPath);
    res.status(200).json({ success: true, message: 'Referans güncellendi.', data: { reference } });
  } catch (err) {
    if (newLogoPath) await deleteFile(newLogoPath);
    throw err;
  }
});

/**
 * @route   DELETE /api/v1/references/:id
 * @access  Private (Admin)
 */
const deleteReference = asyncHandler(async (req, res) => {
  await referenceService.deleteReference(req.params.id);
  res.status(200).json({ success: true, message: 'Referans silindi.', data: null });
});

module.exports = { getReferences, getReferenceById, createReference, updateReference, deleteReference };
