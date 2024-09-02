const express = require('express');
const router = express.Router();
const getHiddenVideoController = require('../controllers/getHiddenVideoController');

// Route để lấy dữ liệu từ database
router.get('/video/get/hidden-video', getHiddenVideoController.getHiddenVideo);

module.exports = router;