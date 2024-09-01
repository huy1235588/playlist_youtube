const express = require('express');
const router = express.Router();
const searchVideoController = require('../controllers/searchVideoController');

// Route để tìm kiếm video
router.get('/video/search', searchVideoController.searchVideoTitle);

module.exports = router;