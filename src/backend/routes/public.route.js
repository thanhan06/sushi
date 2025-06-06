const express = require('express');
const router = express.Router();

const publicController = require('../controllers/public.controller');

router.get('/', publicController.getIndex);
router.get('/admin', publicController.getAdmin);
router.get('/nhanvien', publicController.getNhanVien);

module.exports = router;