const express  = require('express');
const mongoose = require('mongoose');
const os       = require('os');

const authRoutes        = require('./auth.routes');
const statsRoutes       = require('./stats.routes');
const contactRoutes     = require('./contact.routes');
const corporateRoutes   = require('./corporate.routes');
const teamMemberRoutes  = require('./teamMember.routes');
const categoryRoutes    = require('./category.routes');
const referenceRoutes   = require('./reference.routes');
const productRoutes     = require('./product.routes');
const serviceRoutes     = require('./service.routes');
const catalogRoutes     = require('./catalog.routes');
const blogRoutes        = require('./blog.routes');
const mapLocationRoutes = require('./mapLocation.routes');
const siteSettingRoutes = require('./siteSetting.routes');

const router = express.Router();

// ── Health check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown';

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status:    isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()),
    db:        dbStatus,
    memory: {
      used:  Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      free:  Math.round(os.freemem() / 1024 / 1024) + ' MB',
    },
  });
});

router.use('/auth',          authRoutes);
router.use('/stats',         statsRoutes);
router.use('/contact',       contactRoutes);
router.use('/corporate',     corporateRoutes);
router.use('/team',          teamMemberRoutes);
router.use('/categories',    categoryRoutes);
router.use('/products',      productRoutes);
router.use('/services',      serviceRoutes);
router.use('/catalogs',      catalogRoutes);
router.use('/blogs',         blogRoutes);
router.use('/references',    referenceRoutes);
router.use('/map-locations', mapLocationRoutes);
router.use('/site-settings', siteSettingRoutes);

module.exports = router;
