const express = require('express');
const router = express.Router();
const getVideoController = require('../controllers/getVideoController');
const getHiddenVideoController = require('../controllers/getHiddenVideoController');
const getPlaylistsController = require('../controllers/getPlaylistsController')
const getChannelController = require('../controllers/getChannelController');

// Route để lấy dữ liệu từ database
router.get('/video/get', getVideoController.getVideoInfo);

// Route để lấy video bị ẩn từ database
router.get('/video/get/hidden-video', getHiddenVideoController.getHiddenVideo);

// Route để lấy playlists từ database
router.get('/playlist/get', getPlaylistsController.getPlaylists);

// Route để lấy playlist theo id
router.get('/playlist/get/:playlistId', getPlaylistsController.getPlaylistById);

// Route để lấy channel của playlist
router.get('/channel/get', getChannelController.getChannel);

module.exports = router;