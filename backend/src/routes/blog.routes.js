const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blog.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../config/multer');

const router = express.Router();

// Public
router.get('/', getBlogs);
// :identifier — slug ("endüstriyel-su-aritma") veya ObjectId ("64a3f...") ikisini de kabul eder
router.get('/:identifier', getBlog);

// Private (Admin)
router.post('/', protect, uploadImage.single('coverImage'), createBlog);
router.put('/:id', protect, uploadImage.single('coverImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
