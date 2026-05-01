const express = require('express');
const {
  getCatalogs,
  createCatalog,
  deleteCatalog,
  incrementDownload,
} = require('../controllers/catalog.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadCatalog } = require('../config/multer');

const router = express.Router();

// Public
router.get('/', getCatalogs);
router.patch('/:id/download', incrementDownload);

// Private (Admin) — uploadCatalog: pdf (50 MB) + coverImage (5 MB) aynı formda
router.post('/', protect, uploadCatalog, createCatalog);
router.delete('/:id', protect, deleteCatalog);

module.exports = router;
