const TeamMember = require('../../models/TeamMember.model');
const { deleteFile } = require('../utils/fileHelper');

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const getAll = async () => {
  return TeamMember.find({ isActive: true }).sort({ order: 1 });
};

const getAllAdmin = async () => {
  return TeamMember.find().sort({ order: 1 });
};

const create = async (data, photoPath) => {
  const { name, title, bio, linkedin, order, isActive } = data;
  return TeamMember.create({
    name,
    title,
    bio:      bio      || '',
    linkedin: linkedin || '',
    photoPath: photoPath || null,
    order:    order    !== undefined ? Number(order) : 0,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
  });
};

const update = async (id, data, newPhotoPath) => {
  const member = await TeamMember.findById(id);
  if (!member) throw createError('Ekip üyesi bulunamadı.', 404, 'NOT_FOUND');

  const { name, title, bio, linkedin, order, isActive } = data;

  if (name     !== undefined) member.name     = name.trim();
  if (title    !== undefined) member.title    = title.trim();
  if (bio      !== undefined) member.bio      = bio;
  if (linkedin !== undefined) member.linkedin = linkedin;
  if (order    !== undefined) member.order    = Number(order);
  if (isActive !== undefined) member.isActive = isActive === 'true' || isActive === true;

  if (newPhotoPath) {
    await deleteFile(member.photoPath);
    member.photoPath = newPhotoPath;
  }

  await member.save();
  return member;
};

const remove = async (id) => {
  const member = await TeamMember.findById(id);
  if (!member) throw createError('Ekip üyesi bulunamadı.', 404, 'NOT_FOUND');

  await deleteFile(member.photoPath);
  await member.deleteOne();
};

module.exports = { getAll, getAllAdmin, create, update, remove };
