const express = require('express');
const router = express.Router();
const getVideoController = require('../controllers/getVideoController');
const getHiddenVideoController = require('../controllers/getHiddenVideoController');
const getPlaylistsController = require('../controllers/getPlaylistsController')

// Route để lấy dữ liệu từ database
router.get('/video/get', getVideoController.getVideoInfo);

// Route để lấy playlists từ database
router.get('/playlist/get', getPlaylistsController.getPlaylists);

// Route để lấy video bị ẩn từ database
router.get('/video/get/hidden-video', getHiddenVideoController.getHiddenVideo);

module.exports = router;