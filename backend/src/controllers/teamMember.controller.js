const asyncHandler        = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const teamMemberService   = require('../services/teamMember.service');

const getTeam = asyncHandler(async (req, res) => {
  const members = await teamMemberService.getAll();
  res.status(200).json({ success: true, message: 'Ekip getirildi.', data: { members } });
});

const getTeamAdmin = asyncHandler(async (req, res) => {
  const members = await teamMemberService.getAllAdmin();
  res.status(200).json({ success: true, message: 'Ekip (tümü) getirildi.', data: { members } });
});

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

const deleteMember = asyncHandler(async (req, res) => {
  await teamMemberService.remove(req.params.id);
  res.status(200).json({ success: true, message: 'Ekip üyesi silindi.', data: null });
});

module.exports = { getTeam, getTeamAdmin, createMember, updateMember, deleteMember };
