const express = require('express');
const { getCategories, createCategory, deleteCategory } = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/',    getCategories);
router.post('/',   protect, createCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;
