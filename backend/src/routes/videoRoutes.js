const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const replaceVideoController = require('../controllers/replaceVideoController')

// Route để lấy tất cả các video từ youtube api
router.get('/video/fetch', videoController.fetchAndSaveVideos);
// Route để thay thể video trong playlist
router.post('/video/replace', replaceVideoController.replaceVideoInPlaylist);

module.exports = router;