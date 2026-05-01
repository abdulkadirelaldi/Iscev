const asyncHandler = require('../utils/asyncHandler');
const Product      = require('../../models/Product.model');
const Service      = require('../../models/Service.model');
const Catalog      = require('../../models/Catalog.model');
const Blog         = require('../../models/Blog.model');
const MapLocation  = require('../../models/MapLocation.model');
const Reference    = require('../../models/Reference.model');
const Category     = require('../../models/Category.model');

/**
 * @route   GET /api/v1/stats
 * @desc    Admin dashboard istatistikleri — toplam + aktif/yayında sayıları.
 * @access  Private (Admin)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    productsTotal,
    productsActive,
    servicesTotal,
    servicesActive,
    catalogsTotal,
    catalogsActive,
    blogsTotal,
    blogsPublished,
    mapLocationsTotal,
    referencesTotal,
    categoriesTotal,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Service.countDocuments(),
    Service.countDocuments({ isActive: true }),
    Catalog.countDocuments(),
    Catalog.countDocuments({ isActive: true }),
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    MapLocation.countDocuments(),
    Reference.countDocuments(),
    Category.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    message: 'Dashboard istatistikleri getirildi.',
    data: {
      products:     { total: productsTotal,     active: productsActive },
      services:     { total: servicesTotal,     active: servicesActive },
      catalogs:     { total: catalogsTotal,     active: catalogsActive },
      blogs:        { total: blogsTotal,        published: blogsPublished },
      mapLocations: { total: mapLocationsTotal },
      references:   { total: referencesTotal },
      categories:   { total: categoriesTotal },
    },
  });
});

module.exports = { getDashboardStats };
