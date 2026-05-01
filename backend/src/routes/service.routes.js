const express = require('express');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/service.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../config/multer');

const router = express.Router();

// Public
router.get('/', getServices);
router.get('/:id', getServiceById);

// Private (Admin)
router.post('/', protect, uploadImage.single('coverImage'), createService);
router.put('/:id', protect, uploadImage.single('coverImage'), updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
