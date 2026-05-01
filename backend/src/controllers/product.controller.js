const asyncHandler = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const productService = require('../services/product.service');

/**
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const data = await productService.getAllProducts(req.query);
  res.status(200).json({ success: true, message: 'Ürünler getirildi.', data });
});

/**
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, message: 'Ürün getirildi.', data: { product } });
});

/**
 * @route   POST /api/v1/products
 * @access  Private (Admin)
 */
const createProduct = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Kapak görseli zorunludur.',
    });
  }

  const coverImagePath = toRelativePath(req.file.path);

  try {
    const product = await productService.createProduct({ ...req.body, coverImagePath });
    res.status(201).json({ success: true, message: 'Ürün başarıyla oluşturuldu.', data: { product } });
  } catch (err) {
    deleteFile(coverImagePath); // servis hatası durumunda geçici dosyayı temizle
    throw err;
  }
});

/**
 * @route   PUT /api/v1/products/:id
 * @access  Private (Admin)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const newCoverImagePath = req.file ? toRelativePath(req.file.path) : null;

  try {
    const product = await productService.updateProduct(req.params.id, req.body, newCoverImagePath);
    res.status(200).json({ success: true, message: 'Ürün güncellendi.', data: { product } });
  } catch (err) {
    if (newCoverImagePath) deleteFile(newCoverImagePath); // hata halinde yeni dosyayı temizle
    throw err;
  }
});

/**
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Ürün silindi.', data: null });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
