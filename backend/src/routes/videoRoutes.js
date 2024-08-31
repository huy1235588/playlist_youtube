const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Route để lấy tất cả các video từ youtube api
router.get('/video/fetch', videoController.fetchAndSaveVideos);

module.exports = router;