const express = require('express');
const {
  getTeam,
  getTeamAdmin,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/teamMember.controller');
const { protect }      = require('../middlewares/auth.middleware');
const { uploadImage }  = require('../config/multer');

const router = express.Router();

router.get('/',        getTeam);
router.get('/admin',   protect, getTeamAdmin);
router.post('/',       protect, uploadImage.single('photo'), createMember);
router.put('/:id',     protect, uploadImage.single('photo'), updateMember);
router.delete('/:id',  protect, deleteMember);

module.exports = router;
