const Reference = require('../../models/Reference.model');
const { deleteFile } = require('../utils/fileHelper');

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const getAllReferences = async ({ sector, isActive, page = 1, limit = 50 } = {}) => {
  const filter = {};
  if (sector) filter.sector = sector;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);

  const [references, total] = await Promise.all([
    Reference.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Reference.countDocuments(filter),
  ]);

  return { references, total, page: Number(page), limit: Number(limit) };
};

const getReferenceById = async (id) => {
  const reference = await Reference.findById(id);
  if (!reference) throw createError('Referans bulunamadı.', 404, 'NOT_FOUND');
  return reference;
};

const createReference = async (data) => {
  const { name, logoPath, sector, location, isActive, order } = data;

  return Reference.create({
    name,
    logoPath: logoPath || null,
    sector: sector || '',
    location: location || '',
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    order: order !== undefined ? Number(order) : 0,
  });
};

const updateReference = async (id, updates, newLogoPath) => {
  const reference = await Reference.findById(id);
  if (!reference) throw createError('Referans bulunamadı.', 404, 'NOT_FOUND');

  const { name, sector, location, isActive, order } = updates;

  if (name !== undefined) reference.name = name;
  if (sector !== undefined) reference.sector = sector;
  if (location !== undefined) reference.location = location;
  if (isActive !== undefined) reference.isActive = isActive === 'true' || isActive === true;
  if (order !== undefined) reference.order = Number(order);

  if (newLogoPath) {
    await deleteFile(reference.logoPath);
    reference.logoPath = newLogoPath;
  }

  await reference.save();
  return reference;
};

const deleteReference = async (id) => {
  const reference = await Reference.findById(id);
  if (!reference) throw createError('Referans bulunamadı.', 404, 'NOT_FOUND');

  await deleteFile(reference.logoPath);
  await reference.deleteOne();
};

module.exports = {
  getAllReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
};
