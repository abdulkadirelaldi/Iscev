const Product = require('../../models/Product.model');
const { deleteFile } = require('../utils/fileHelper');

// Servis katmanı hataları statusCode + code ile fırlatır;
// global error handler (app.js) bunları okuyarak doğru HTTP yanıtını oluşturur.
const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

/**
 * Ürün listesi — kategori, isActive filtresi, sayfalama destekli.
 */
const getAllProducts = async ({ category, isActive, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return { products, total, page: Number(page), limit: Number(limit) };
};

/**
 * ID'ye göre tekil ürün — bulunamazsa 404 fırlatır.
 */
const getProductById = async (id) => {
  const mongoose = require('mongoose');
  const isObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
  const product = isObjectId
    ? await Product.findById(id).populate('category', 'name slug')
    : await Product.findOne({ slug: id }).populate('category', 'name slug');
  if (!product) throw createError('Ürün bulunamadı.', 404, 'NOT_FOUND');
  return product;
};

/**
 * Yeni ürün oluşturur.
 * @param {object} data - { name, description, content, category, coverImagePath,
 *                          technicalSpecs (JSON string veya object), isActive, order }
 */
const createProduct = async (data) => {
  const { name, description, content, category, coverImagePath,
          technicalSpecs, isActive, order } = data;

  let parsedSpecs = {};
  if (technicalSpecs) {
    try {
      parsedSpecs = typeof technicalSpecs === 'string'
        ? JSON.parse(technicalSpecs)
        : technicalSpecs;
    } catch {
      throw createError(
        'technicalSpecs geçerli bir JSON nesnesi olmalıdır.',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  return Product.create({
    name,
    description,
    content,
    category,
    coverImagePath,
    technicalSpecs: parsedSpecs,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    order: order !== undefined ? Number(order) : 0,
  });
};

/**
 * Ürün günceller.
 * Yeni kapak görseli yüklenirse eski dosya diskten silinir.
 * @param {string} id
 * @param {object} updates   - req.body alanları
 * @param {string|null} newCoverImagePath - toRelativePath ile dönüştürülmüş yeni yol
 */
const updateProduct = async (id, updates, newCoverImagePath) => {
  const product = await Product.findById(id);
  if (!product) throw createError('Ürün bulunamadı.', 404, 'NOT_FOUND');

  const { name, description, content, category, technicalSpecs, isActive, order } = updates;

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (content !== undefined) product.content = content;
  if (category !== undefined) product.category = category;
  if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;
  if (order !== undefined) product.order = Number(order);

  if (technicalSpecs !== undefined) {
    try {
      product.technicalSpecs = typeof technicalSpecs === 'string'
        ? JSON.parse(technicalSpecs)
        : technicalSpecs;
    } catch {
      throw createError(
        'technicalSpecs geçerli bir JSON nesnesi olmalıdır.',
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  if (newCoverImagePath) {
    await deleteFile(product.coverImagePath); // eski görseli diskten kaldır
    product.coverImagePath = newCoverImagePath;
  }

  await product.save();
  return product;
};

/**
 * Ürünü ve ilişkili tüm görsel dosyalarını siler.
 */
const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw createError('Ürün bulunamadı.', 404, 'NOT_FOUND');

  await Promise.all([
    deleteFile(product.coverImagePath),
    ...(Array.isArray(product.galleryImagePaths)
      ? product.galleryImagePaths.map(deleteFile)
      : []),
  ]);

  await product.deleteOne();
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
