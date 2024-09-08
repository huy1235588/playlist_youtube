const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const deleteController = require('../controllers/videoActionController');

// Route để lấy tất cả các video từ youtube api
router.get('/video/fetch', videoController.fetchAndSaveVideos);

// Route để xóa video trong database
router.get('/video/delete', deleteController.deleteVideo);

module.exports = router;