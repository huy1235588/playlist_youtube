
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Route để lấy tất cả các video
router.get('/videos/fetch', videoController.fetchAndSaveVideos);

module.exports = router;