const express = require('express');
const router = express.Router();
const getVideoController = require('../controllers/getVideoController');

// Route để lấy dữ liệu từ database
router.get('/video/get', getVideoController.getVideoInfo);

module.exports = router;