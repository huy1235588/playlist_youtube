const express = require('express');
const router = express.Router();
const getVideoController = require('../controllers/getVideoController');

// Route để lấy dữ liệu từ database
router.get('/video/get/hidden-video', getVideoController.getVideoInfo);

module.exports = router;