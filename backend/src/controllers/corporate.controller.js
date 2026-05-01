const asyncHandler        = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const corporateService    = require('../services/corporate.service');
const teamMemberService   = require('../services/teamMember.service');

// ─── Corporate Content ────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/corporate
 * @desc    Tüm kurumsal içeriği + ekip üyelerini tek istekte döner.
 * @access  Public
 */
const getContent = asyncHandler(async (req, res) => {
  const [content, team] = await Promise.all([
    corporateService.getContent(),
    teamMemberService.getAll(),
  ]);

  const { heroStats, values, milestones, regions, globalStats, certs } = content;

  res.status(200).json({
    success: true,
    message: 'Kurumsal içerik getirildi.',
    data: { heroStats, values, milestones, regions, globalStats, certs, team },
  });
});

const updateHeroStats = asyncHandler(async (req, res) => {
  const content = await corporateService.updateSection('heroStats', req.body.items);
  res.status(200).json({ success: true, message: 'Hero istatistikleri güncellendi.', data: { content } });
});

const updateValues = asyncHandler(async (req, res) => {
  const content = await corporateService.updateSection('values', req.body.items);
  res.status(200).json({ success: true, message: 'Değerler güncellendi.', data: { content } });
});

const updateMilestones = asyncHandler(async (req, res) => {
  const content = await corporateService.updateSection('milestones', req.body.items);
  res.status(200).json({ success: true, message: 'Kilometre taşları güncellendi.', data: { content } });
});

const updateGlobalStats = asyncHandler(async (req, res) => {
  const content = await corporateService.updateSection('globalStats', req.body.items);
  res.status(200).json({ success: true, message: 'Global istatistikler güncellendi.', data: { content } });
});

const updateRegions = asyncHandler(async (req, res) => {
  const content = await corporateService.updateSection('regions', req.body.items);
  res.status(200).json({ success: true, message: 'Bölgeler güncellendi.', data: { content } });
});

const updateCerts = asyncHandler(async (req, res) => {
  const content = await corporateService.updateSection('certs', req.body.items);
  res.status(200).json({ success: true, message: 'Sertifikalar güncellendi.', data: { content } });
});

// ─── Team CRUD ────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/corporate/team
 * @access  Public
 */
const getTeam = asyncHandler(async (req, res) => {
  const members = await teamMemberService.getAll();
  res.status(200).json({ success: true, message: 'Ekip getirildi.', data: { members } });
});

/**
 * @route   POST /api/v1/corporate/team
 * @access  Private (Admin)
 */
const createMember = asyncHandler(async (req, res) => {
  const photoPath = req.file ? toRelativePath(req.file.path) : null;
  try {
    const member = await teamMemberService.create(req.body, photoPath);
    res.status(201).json({ success: true, message: 'Ekip üyesi oluşturuldu.', data: { member } });
  } catch (err) {
    if (photoPath) await deleteFile(photoPath);
    throw err;
  }
});

/**
 * @route   PUT /api/v1/corporate/team/:id
 * @access  Private (Admin)
 */
const updateMember = asyncHandler(async (req, res) => {
  const newPhotoPath = req.file ? toRelativePath(req.file.path) : null;
  try {
    const member = await teamMemberService.update(req.params.id, req.body, newPhotoPath);
    res.status(200).json({ success: true, message: 'Ekip üyesi güncellendi.', data: { member } });
  } catch (err) {
    if (newPhotoPath) await deleteFile(newPhotoPath);
    throw err;
  }
});

/**
 * @route   DELETE /api/v1/corporate/team/:id
 * @access  Private (Admin)
 */
const deleteMember = asyncHandler(async (req, res) => {
  await teamMemberService.remove(req.params.id);
  res.status(200).json({ success: true, message: 'Ekip üyesi silindi.', data: null });
});

module.exports = {
  getContent,
  updateHeroStats, updateValues, updateMilestones,
  updateGlobalStats, updateRegions, updateCerts,
  getTeam, createMember, updateMember, deleteMember,
};
