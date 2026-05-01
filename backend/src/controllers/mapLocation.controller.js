const path = require('path');
const fs = require('fs');
const MapLocation = require('../../models/MapLocation.model');
const asyncHandler = require('../utils/asyncHandler');

const toRelativePath = (absolutePath) => {
  const idx = absolutePath.replace(/\\/g, '/').indexOf('uploads/');
  return idx !== -1 ? absolutePath.replace(/\\/g, '/').slice(idx) : absolutePath;
};

const deleteFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, '../../', relativePath);
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (_) {}
  }
};

/**
 * @route   GET /api/v1/map-locations
 * @desc    Tüm harita pinlerini getir (isActive filtresi)
 * @access  Public
 */
const getMapLocations = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const locations = await MapLocation.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Harita lokasyonları getirildi.',
    data: { locations },
  });
});

/**
 * @route   GET /api/v1/map-locations/:id
 * @desc    Tekil lokasyon getir
 * @access  Public
 */
const getMapLocationById = asyncHandler(async (req, res) => {
  const location = await MapLocation.findById(req.params.id);

  if (!location) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Lokasyon bulunamadı.',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lokasyon getirildi.',
    data: { location },
  });
});

/**
 * @route   POST /api/v1/map-locations
 * @desc    Yeni santral/proje pini ekle
 * @access  Private (Admin)
 *
 * Body: projectName, description, country, latitude, longitude, isActive
 * File: image (opsiyonel, .jpg/.png)
 */
const createMapLocation = asyncHandler(async (req, res) => {
  const { projectName, description, country, latitude, longitude, isActive } = req.body;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    if (req.file) deleteFile(toRelativePath(req.file.path));
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Geçerli latitude ve longitude değerleri zorunludur.',
    });
  }

  const imageFilePath = req.file ? toRelativePath(req.file.path) : null;

  // Modelin createFromLatLng static metodu [lng, lat] GeoJSON sırasını otomatik düzenler
  const location = await MapLocation.createFromLatLng(
    {
      projectName,
      description,
      country,
      imageFilePath,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    },
    lat,
    lng
  );

  res.status(201).json({
    success: true,
    message: 'Harita lokasyonu oluşturuldu.',
    data: { location },
  });
});

/**
 * @route   PUT /api/v1/map-locations/:id
 * @desc    Lokasyon güncelle (koordinat ve/veya görsel dahil)
 * @access  Private (Admin)
 */
const updateMapLocation = asyncHandler(async (req, res) => {
  const location = await MapLocation.findById(req.params.id);

  if (!location) {
    if (req.file) deleteFile(toRelativePath(req.file.path));
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Lokasyon bulunamadı.',
    });
  }

  const { projectName, description, country, latitude, longitude, isActive } = req.body;

  if (projectName !== undefined) location.projectName = projectName;
  if (description !== undefined) location.description = description;
  if (country !== undefined) location.country = country;
  if (isActive !== undefined) location.isActive = isActive === 'true' || isActive === true;

  if (latitude !== undefined && longitude !== undefined) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      if (req.file) deleteFile(toRelativePath(req.file.path));
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Geçerli latitude ve longitude değerleri giriniz.',
      });
    }

    // GeoJSON: [longitude, latitude] sırası
    location.location = { type: 'Point', coordinates: [lng, lat] };
  }

  if (req.file) {
    deleteFile(location.imageFilePath);
    location.imageFilePath = toRelativePath(req.file.path);
  }

  await location.save();

  res.status(200).json({
    success: true,
    message: 'Lokasyon güncellendi.',
    data: { location },
  });
});

/**
 * @route   DELETE /api/v1/map-locations/:id
 * @desc    Lokasyonu ve varsa görselini sil
 * @access  Private (Admin)
 */
const deleteMapLocation = asyncHandler(async (req, res) => {
  const location = await MapLocation.findById(req.params.id);

  if (!location) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Lokasyon bulunamadı.',
    });
  }

  deleteFile(location.imageFilePath);
  await location.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Lokasyon silindi.',
    data: null,
  });
});

module.exports = {
  getMapLocations,
  getMapLocationById,
  createMapLocation,
  updateMapLocation,
  deleteMapLocation,
};
