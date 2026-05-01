const Category = require('../../models/Category.model');
const Product   = require('../../models/Product.model');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/v1/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({
    success: true,
    message: 'Kategoriler getirildi.',
    data: { categories },
  });
});

/**
 * @route   POST /api/v1/categories
 * @access  Private (Admin)
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Kategori adı zorunludur.',
    });
  }

  const category = await Category.create({ name: name.trim() });
  res.status(201).json({
    success: true,
    message: 'Kategori oluşturuldu.',
    data: { category },
  });
});

/**
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (Admin)
 * @note    Bu kategoriye bağlı ürün varsa silme işlemi reddedilir.
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Kategori bulunamadı.',
    });
  }

  const linkedProductCount = await Product.countDocuments({
    category: category._id,
  });

  if (linkedProductCount > 0) {
    return res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: `Bu kategoriye bağlı ${linkedProductCount} ürün var. Önce ürünleri başka bir kategoriye taşıyın.`,
    });
  }

  await category.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Kategori silindi.',
    data: null,
  });
});

module.exports = { getCategories, createCategory, deleteCategory };
