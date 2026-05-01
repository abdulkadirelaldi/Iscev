const asyncHandler = require('../utils/asyncHandler');
const { toRelativePath, deleteFile } = require('../utils/fileHelper');
const blogService = require('../services/blog.service');

/**
 * @route   GET /api/v1/blogs
 * @desc    Tüm blogları listele (status/tag filtresi, sayfalama). İçerik alanı dahil değil.
 * @access  Public
 */
const getBlogs = asyncHandler(async (req, res) => {
  const data = await blogService.getAllBlogs(req.query);
  res.status(200).json({ success: true, message: 'Blog yazıları getirildi.', data });
});

/**
 * @route   GET /api/v1/blogs/:identifier
 * @desc    Slug veya MongoDB ObjectId ile tekil blog getir. viewCount arka planda artar.
 * @access  Public
 */
const getBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogBySlugOrId(req.params.identifier);
  res.status(200).json({ success: true, message: 'Blog yazısı getirildi.', data: { blog } });
});

/**
 * @route   POST /api/v1/blogs
 * @desc    Yeni blog yazısı oluştur (kapak görseli zorunlu).
 *          tags: JSON dizisi string'i ("["a","b"]") veya virgülle ayrılmış ("a,b,c")
 *          status: 'draft' (varsayılan) veya 'published' — published seçilirse
 *                  publishedAt pre-save hook ile otomatik set edilir.
 * @access  Private (Admin)
 */
const createBlog = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Kapak görseli zorunludur.',
    });
  }

  const coverImagePath = toRelativePath(req.file.path);

  try {
    const blog = await blogService.createBlog({ ...req.body, coverImagePath });
    res.status(201).json({ success: true, message: 'Blog yazısı oluşturuldu.', data: { blog } });
  } catch (err) {
    await deleteFile(coverImagePath);
    throw err;
  }
});

/**
 * @route   PUT /api/v1/blogs/:id
 * @desc    Blog güncelle. Yeni görsel yüklenirse eskisi silinir.
 * @access  Private (Admin)
 */
const updateBlog = asyncHandler(async (req, res) => {
  const newCoverImagePath = req.file ? toRelativePath(req.file.path) : null;

  try {
    const blog = await blogService.updateBlog(req.params.id, req.body, newCoverImagePath);
    res.status(200).json({ success: true, message: 'Blog yazısı güncellendi.', data: { blog } });
  } catch (err) {
    if (newCoverImagePath) await deleteFile(newCoverImagePath);
    throw err;
  }
});

/**
 * @route   DELETE /api/v1/blogs/:id
 * @desc    Blog ve kapak görselini sil.
 * @access  Private (Admin)
 */
const deleteBlog = asyncHandler(async (req, res) => {
  await blogService.deleteBlog(req.params.id);
  res.status(200).json({ success: true, message: 'Blog yazısı silindi.', data: null });
});

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };
