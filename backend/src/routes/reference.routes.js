const express = require('express');
const {
  getReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
} = require('../controllers/reference.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../config/multer');

const router = express.Router();

// Public
router.get('/',    getReferences);
router.get('/:id', getReferenceById);

// Private (Admin)
router.post('/',    protect, uploadImage.single('logo'), createReference);
router.put('/:id',  protect, uploadImage.single('logo'), updateReference);
router.delete('/:id', protect, deleteReference);

module.exports = router;
