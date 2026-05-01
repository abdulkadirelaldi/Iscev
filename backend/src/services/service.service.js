const Service = require('../../models/Service.model');
const { deleteFile } = require('../utils/fileHelper');

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const getAllServices = async ({ category, isActive, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate('category', 'name slug')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Service.countDocuments(filter),
  ]);

  return { services, total, page: Number(page), limit: Number(limit) };
};

const getServiceById = async (id) => {
  const mongoose = require('mongoose');
  const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
  const service = isObjectId
    ? await Service.findById(id).populate('category', 'name slug')
    : await Service.findOne({ slug: id }).populate('category', 'name slug');
  if (!service) throw createError('Hizmet bulunamadı.', 404, 'NOT_FOUND');
  return service;
};

const createService = async (data) => {
  const { name, description, content, category, coverImagePath, isActive, order } = data;

  return Service.create({
    name,
    description,
    content,
    category,
    coverImagePath,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    order: order !== undefined ? Number(order) : 0,
  });
};

const updateService = async (id, updates, newCoverImagePath) => {
  const service = await Service.findById(id);
  if (!service) throw createError('Hizmet bulunamadı.', 404, 'NOT_FOUND');

  const { name, description, content, category, isActive, order } = updates;

  if (name !== undefined) service.name = name;
  if (description !== undefined) service.description = description;
  if (content !== undefined) service.content = content;
  if (category !== undefined) service.category = category;
  if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;
  if (order !== undefined) service.order = Number(order);

  if (newCoverImagePath) {
    await deleteFile(service.coverImagePath);
    service.coverImagePath = newCoverImagePath;
  }

  await service.save();
  return service;
};

const deleteService = async (id) => {
  const service = await Service.findById(id);
  if (!service) throw createError('Hizmet bulunamadı.', 404, 'NOT_FOUND');

  await Promise.all([
    deleteFile(service.coverImagePath),
    ...(Array.isArray(service.galleryImagePaths)
      ? service.galleryImagePaths.map(deleteFile)
      : []),
  ]);

  await service.deleteOne();
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
