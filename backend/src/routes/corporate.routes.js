const express = require('express');
const {
  getContent,
  updateHeroStats, updateValues, updateMilestones,
  updateGlobalStats, updateRegions, updateCerts,
  getTeam, createMember, updateMember, deleteMember,
} = require('../controllers/corporate.controller');
const { protect }     = require('../middlewares/auth.middleware');
const { uploadImage } = require('../config/multer');

const router = express.Router();

// ─── Corporate Content ────────────────────────────────────────────────────────
router.get('/',              getContent);                        // public — team dahil
router.put('/hero-stats',   protect, updateHeroStats);
router.put('/values',       protect, updateValues);
router.put('/milestones',   protect, updateMilestones);
router.put('/global-stats', protect, updateGlobalStats);
router.put('/regions',      protect, updateRegions);
router.put('/certs',        protect, updateCerts);

// ─── Team CRUD ────────────────────────────────────────────────────────────────
router.get('/team',        getTeam);                                              // public
router.post('/team',       protect, uploadImage.single('photo'), createMember);   // admin
router.put('/team/:id',    protect, uploadImage.single('photo'), updateMember);   // admin
router.delete('/team/:id', protect, deleteMember);                                // admin

module.exports = router;
