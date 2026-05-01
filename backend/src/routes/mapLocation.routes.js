const express = require('express');
const {
  getMapLocations,
  getMapLocationById,
  createMapLocation,
  updateMapLocation,
  deleteMapLocation,
} = require('../controllers/mapLocation.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../config/multer');

const router = express.Router();

// Public
router.get('/', getMapLocations);
router.get('/:id', getMapLocationById);

// Private (Admin)
router.post('/', protect, uploadImage.single('image'), createMapLocation);
router.put('/:id', protect, uploadImage.single('image'), updateMapLocation);
router.delete('/:id', protect, deleteMapLocation);

module.exports = router;
